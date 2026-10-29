import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LUMASHIFT — Ambient-Lighting & Optical Environment Appearance Architect',
  description: 'Target Illuminant Calibration to Parametric YouCam Virtual Try-On Synthesis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-zinc-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
