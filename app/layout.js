import './globals.css';

export const metadata = {
  title: 'Krishna Joshi | Front-End Developer',
  description: 'Front-End Developer based in London, UK. 5+ years crafting responsive, high-performance web experiences with React, JavaScript & modern CSS.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
