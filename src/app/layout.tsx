import type { Metadata } from 'next';
import { Inter, Alex_Brush } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import Link from 'next/link';
import Image from 'next/image';
import { ModelProvider } from '@/context/ModelContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const alexBrush = Alex_Brush({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-alex-brush',
});

export const metadata: Metadata = {
  title: 'RecruitAssist AI',
  description: 'JD Breakdown + Boolean Builder App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'antialiased font-sans',
          inter.variable,
          alexBrush.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModelProvider>
            <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
              <main className="flex-grow">{children}</main>
              <footer className="py-4 px-8 text-center">
                <div className="flex flex-row items-center justify-center gap-2">
                  <Link
                    href="https://suitable.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-muted-foreground hover:text-primary transition-colors"
                  >
                    Made with ❤️ by Suitable AI
                  </Link>
                </div>
              </footer>
            </div>
          </ModelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
