import { Poppins } from 'next/font/google';
import { AuthProvider } from '@/lib/AuthContext';
import "./globals.css";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Forum Gamer',
  description: 'Forum untuk para gamers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
