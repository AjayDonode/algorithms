import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Scratchpad } from '@/components/Scratchpad';

export const metadata: Metadata = {
  title: 'AlgoVerse — Learn Algorithms Visually',
  description: 'An interactive algorithms learning portal with step-by-step visualizations, plain-English explanations, and real Java source code.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Scratchpad />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

