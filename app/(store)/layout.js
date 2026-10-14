import './store.css';
import Shell from '../../components/store/Shell';

export const metadata = {
  title: 'Abdullah Store',
  description: 'Quality products, honest prices and fast delivery across Bangladesh.',
  
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%23f2530a'/%3E%3Ctext x='50' y='68' font-size='56' text-anchor='middle'%3E%F0%9F%9B%8D%EF%B8%8F%3C/text%3E%3C/svg%3E" }
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#f2530a' };

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;700&display=swap" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
