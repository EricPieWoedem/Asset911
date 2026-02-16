'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/redux/providers';
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <Providers>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH}>
        <html lang='en'>
          <body className={inter.className}>{children}</body>
        </html>
      </GoogleOAuthProvider>
    </Providers>
  );
}
