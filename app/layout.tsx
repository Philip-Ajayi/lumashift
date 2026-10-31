
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LumaShift — See yourself in a different light',
  description:
    'Explore how lighting changes your appearance. Find the right look for every environment.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
