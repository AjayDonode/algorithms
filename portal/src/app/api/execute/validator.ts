/**
 * Static security validator for the AlgoVerse scratchpad.
 *
 * Strategy: strip comments/strings first, then pattern-match on the
 * remaining "structural" code so comment-bypass tricks don't work.
 *
 * We're deliberately conservative — these patterns should never appear
 * in educational sorting/searching algorithm code.
 */

export type Lang = 'java' | 'python' | 'javascript';

export interface ValidationResult {
  safe: boolean;
  violations: string[];
}

// ── Comment / string strippers ───────────────────────────────
// Removes content that could be used to smuggle blocked keywords
// through comment or string literals.

function stripJavaCommentsAndStrings(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')   // /* block comments */
    .replace(/\/\/[^\n]*/g, ' ')         // // line comments
    .replace(/"(?:[^"\\]|\\.)*"/g, '""') // "string literals"
    .replace(/'(?:[^'\\]|\\.)*'/g, "''") // 'char literals'
}

function stripPythonCommentsAndStrings(src: string): string {
  return src
    .replace(/"""[\s\S]*?"""/g, '""')    // """docstrings"""
    .replace(/'''[\s\S]*?'''/g, "''")    // '''docstrings'''
    .replace(/#[^\n]*/g, ' ')            // # line comments
    .replace(/"(?:[^"\\]|\\.)*"/g, '""') // "string literals"
    .replace(/'(?:[^'\\]|\\.)*'/g, "''") // 'string literals'
}

function stripJsCommentsAndStrings(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/`[\s\S]*?`/g, '``')        // template literals
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
}

// ── Dangerous pattern definitions ────────────────────────────

const JAVA_RULES: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /Runtime\s*\.\s*(exec|getRuntime|halt)/,            message: 'Process execution (Runtime.exec) is not allowed' },
  { pattern: /ProcessBuilder/,                                    message: 'ProcessBuilder is not allowed' },
  { pattern: /System\s*\.\s*(exit|setSecurityManager)\s*\(/,     message: 'System.exit / setSecurityManager is not allowed' },
  { pattern: /System\s*\.\s*(setOut|setErr|setIn)\s*\(/,         message: 'Redirecting System streams is not allowed' },
  { pattern: /java\.nio\.file\.(Files|Path|Paths)\s*\.\s*(write|delete|move|copy|create)/i, message: 'File write/delete operations are not allowed' },
  { pattern: /new\s+File(Writer|OutputStream|PrintWriter)\s*\(/, message: 'File write operations are not allowed' },
  { pattern: /java\.net\.(URL|Socket|ServerSocket|HttpURLConnection|InetAddress)/i, message: 'Network access (java.net) is not allowed' },
  { pattern: /java\.lang\.reflect\.(Method|Field|Constructor)/,  message: 'Reflection is not allowed' },
  { pattern: /\.setAccessible\s*\(\s*true\s*\)/,                 message: 'setAccessible(true) is not allowed' },
  { pattern: /(URLClassLoader|ClassLoader)\s*\./,                 message: 'ClassLoader manipulation is not allowed' },
  { pattern: /sun\.misc\.Unsafe/,                                 message: 'Unsafe is not allowed' },
  { pattern: /Thread\s*\.\s*sleep\s*\(\s*\d{5,}/,               message: 'Sleep longer than 9999ms is not allowed' },
  { pattern: /Runtime\s*\.\s*addShutdownHook/,                   message: 'Shutdown hooks are not allowed' },
  { pattern: /SecurityManager/,                                   message: 'SecurityManager manipulation is not allowed' },
  { pattern: /java\.lang\.instrument/,                            message: 'Java instrumentation is not allowed' },
  // Prevent fork bombs / resource exhaustion
  { pattern: /new\s+Thread\s*\([\s\S]{0,200}new\s+Thread\s*\(/, message: 'Nested thread creation pattern detected' },
];

const PYTHON_RULES: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\bos\s*\.\s*(system|popen|execl|execle|execlp|execv|execve|execvp|execvpe)\b/, message: 'os.system / os.exec are not allowed' },
  { pattern: /\bos\s*\.\s*(fork|kill|killpg|remove|unlink|rmdir|removedirs|rmtree)\b/,       message: 'Process/file operations via os module are not allowed' },
  { pattern: /\bimport\s+subprocess\b|\bfrom\s+subprocess\b/,    message: 'subprocess module is not allowed' },
  { pattern: /\bimport\s+socket\b|\bfrom\s+socket\b/,            message: 'socket module is not allowed' },
  { pattern: /\bimport\s+(urllib|requests|httpx|aiohttp)\b|\bfrom\s+(urllib|requests|httpx|aiohttp)\b/, message: 'Network libraries are not allowed' },
  { pattern: /\bimport\s+(ctypes|cffi|mmap)\b/,                  message: 'Low-level memory libraries are not allowed' },
  { pattern: /\bimport\s+multiprocessing\b|\bfrom\s+multiprocessing\b/, message: 'multiprocessing module is not allowed' },
  { pattern: /\bopen\s*\([^)]*,\s*['"]\s*[wa+]['"]/,             message: 'Writing to files is not allowed' },
  { pattern: /\b__import__\s*\(/,                                 message: '__import__ is not allowed' },
  { pattern: /\beval\s*\(/,                                       message: 'eval() is not allowed' },
  { pattern: /\bexec\s*\(/,                                       message: 'exec() is not allowed' },
  { pattern: /\bcompile\s*\([^)]+,\s*['"]exec['"]/,              message: 'compile(exec) is not allowed' },
  { pattern: /\bgetattr\s*\([^)]+__/,                            message: 'Dunder attribute access via getattr is not allowed' },
  { pattern: /\b(globals|locals)\s*\(\s*\)\s*\[/,                message: 'globals()/locals() dict mutation is not allowed' },
  // Prevent fork bombs
  { pattern: /while\s+True\s*:[\s\S]{0,50}(thread|Thread|Process|fork)/i, message: 'Infinite process/thread spawning detected' },
];

const JS_RULES: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\bprocess\s*\.\s*exit\s*\(/,                        message: 'process.exit() is not allowed' },
  { pattern: /\bprocess\s*\.\s*(env|binding|dlopen|kill)\b/,      message: 'process.env / process.binding is not allowed' },
  { pattern: /require\s*\(\s*['"](?:fs|child_process|net|http|https|os|cluster|worker_threads|vm|tls|dgram|readline)['"]\s*\)/, message: 'Node.js system modules (fs, child_process, net…) are not allowed' },
  { pattern: /\bimport\s*\(['"](fs|child_process|net|http|https)['"]\)/, message: 'Dynamic import of system modules is not allowed' },
  { pattern: /\bfetch\s*\(/,                                      message: 'Network fetch() is not allowed' },
  { pattern: /\bXMLHttpRequest\b/,                                message: 'XMLHttpRequest is not allowed' },
  { pattern: /\bWebSocket\s*\(/,                                  message: 'WebSocket is not allowed' },
  { pattern: /\beval\s*\(/,                                       message: 'eval() is not allowed' },
  { pattern: /new\s+Function\s*\(/,                               message: 'new Function() is not allowed' },
  { pattern: /__proto__\s*=/,                                      message: '__proto__ mutation (prototype pollution) is not allowed' },
  { pattern: /Object\.setPrototypeOf/,                            message: 'Object.setPrototypeOf is not allowed' },
  { pattern: /\bsetInterval\s*\([^,]+,\s*0\s*\)/,                message: 'setInterval with 0ms delay is not allowed' },
];

const RULES_BY_LANG: Record<Lang, typeof JAVA_RULES> = {
  java:       JAVA_RULES,
  python:     PYTHON_RULES,
  javascript: JS_RULES,
};

const STRIP_BY_LANG: Record<Lang, (s: string) => string> = {
  java:       stripJavaCommentsAndStrings,
  python:     stripPythonCommentsAndStrings,
  javascript: stripJsCommentsAndStrings,
};

// ── Structural limits ────────────────────────────────────────

const MAX_LINES: Record<Lang, number> = {
  java: 200, python: 200, javascript: 200,
};
const MAX_BYTES = 32_000; // 32 KB max code size

// ── Main validator ───────────────────────────────────────────

export function validate(lang: Lang, code: string): ValidationResult {
  const violations: string[] = [];

  // 1. Size check
  if (Buffer.byteLength(code, 'utf-8') > MAX_BYTES) {
    violations.push(`Code exceeds ${MAX_BYTES / 1000}KB size limit`);
  }

  // 2. Line count
  const lines = code.split('\n').length;
  if (lines > MAX_LINES[lang]) {
    violations.push(`Code exceeds ${MAX_LINES[lang]}-line limit (${lines} lines)`);
  }

  // 3. Strip comments and strings, then check dangerous patterns
  const stripped = STRIP_BY_LANG[lang](code);
  for (const { pattern, message } of RULES_BY_LANG[lang]) {
    if (pattern.test(stripped)) {
      violations.push(message);
    }
  }

  return { safe: violations.length === 0, violations };
}
