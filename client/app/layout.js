import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from '@/app/contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Chatterbox",
  description: "The Chat app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
            {children}
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
