import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
    title: 'РЫБАЛКА · Повязки Pepeland',
    description: 'Рыбалка и магазин макарон',
    icons: {
        icon: '/static/icons/icon.svg',
        shortcut: '/static/icons/icon.svg',
        apple: '/static/icons/icon.svg'
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" className={inter.className}>
            <body>{children}</body>
        </html>
    );
}
