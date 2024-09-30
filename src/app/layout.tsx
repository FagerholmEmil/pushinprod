import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AI } from './[github-user]/[github-repo]/_chat/actions';
import { Toaster } from '@/components/ui/sonner';
import { Provider } from 'jotai';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Pushin Prod',
  description: 'Visually explore your GitHub repositories',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <Provider>
          <AI>{children}</AI>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
