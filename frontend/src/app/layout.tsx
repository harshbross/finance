import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import NavBar from "../components/NavBar";

export const metadata: Metadata = {
  title: "Aether Shop - Premium E-Commerce Dashboard",
  description: "Browse high-tech products and manage orders with glassmorphic dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <NavBar />
              <main style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {children}
              </main>
              <footer style={{
                textAlign: 'center',
                padding: '30px 24px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                borderTop: '1px solid var(--border-glass)',
                marginTop: '40px',
                background: 'rgba(10, 9, 21, 0.4)'
              }}>
                <p>&copy; {new Date().getFullYear()} Aether Shop. Built with Next.js, Express, and Prisma.</p>
              </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
