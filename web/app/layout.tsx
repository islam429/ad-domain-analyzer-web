import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer
          style={{
            marginTop: "3rem",
            borderTop: "1px solid #e2e8f0",
            padding: "1.5rem 0",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#475569",
          }}
        >
          <span>Angemeldet? </span>
          <Link href="/dashboard" style={{ color: "#2563eb" }}>
            Zum Dashboard
          </Link>
          <span> · </span>
          <Link href="/login" style={{ color: "#2563eb" }}>
            Login
          </Link>
        </footer>
      </body>
    </html>
  );
}
