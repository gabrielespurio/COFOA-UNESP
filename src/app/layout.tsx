import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'COFOA XV — 15º Congresso da Faculdade de Odontologia de Araçatuba',
    template: '%s | COFOA XV',
  },
  description:
    'COFOA XV — 15º Congresso da Faculdade de Odontologia de Araçatuba. 25 a 28 de novembro de 2026. FOA UNESP, Araçatuba/SP.',
  keywords: [
    'COFOA XV',
    'Congresso Odontologia',
    'FOA UNESP',
    'Araçatuba',
    'Odontologia',
    'Congresso Acadêmico',
    '2026',
  ],
  openGraph: {
    title: 'COFOA XV — 15º Congresso da Faculdade de Odontologia de Araçatuba',
    description:
      '25 a 28 de novembro de 2026 — FOA UNESP, Araçatuba/SP. Quatro dias para conectar conhecimento, inovação e excelência em odontologia.',
    url: 'https://cofoa.foa.unesp.br',
    siteName: 'COFOA XV',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
