import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'May Myan AI - Chatbot Management',
  description: 'Manage multiple multi-tenant AI chatbots for your websites',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#09090b] text-slate-100 antialiased selection:bg-blue-500/30`}>
        {children}
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a'
          }
        }} />
      </body>
    </html>
  );
}
