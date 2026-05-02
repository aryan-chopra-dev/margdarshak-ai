import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Margdarshak AI — Your AI Guide to Higher Education & Loan Readiness",
  description: "AI-powered student engagement platform that guides Indian students through university discovery, admission prep, and education loan applications. Built for Poonawala Fincorp.",
  keywords: ["education loan", "study abroad", "AI career navigator", "university rankings", "Poonawala Fincorp", "loan readiness score"],
};

// Inline script to apply saved theme BEFORE first paint — prevents flash
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('margdarshak-storage');
    if (stored) {
      var state = JSON.parse(stored);
      if (state && state.state && state.state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
        {/* Anti-flash theme script — must run before body renders */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AuthGuard>
          <Navbar />
          <main>{children}</main>
          <ChatWidget />
        </AuthGuard>
      </body>
    </html>
  );
}
