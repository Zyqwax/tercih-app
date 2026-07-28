import "./globals.css";
import { Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import AppHeader from "@/components/layout/AppHeader";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "YÖK Tercih Asistanı",
  description:
    "YÖK Atlas verileriyle üniversite programlarını karşılaştırın ve tercih listenizi hazırlayın.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`h-full scroll-smooth ${inter.variable}`}>
      <body className="min-h-full bg-mesh" style={{ backgroundColor: "var(--bg-base)" }}>
        <AppProvider>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
