import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hadith Status Agent',
  description: 'Analyze PDF books to determine narrator status.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
