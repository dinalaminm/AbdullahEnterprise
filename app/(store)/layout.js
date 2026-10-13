import './store.css';
import Shell from '../../components/store/Shell';

export const metadata = { title: 'Abdullah Store' };
export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
