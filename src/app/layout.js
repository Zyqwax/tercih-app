import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AppHeader from "@/components/layout/AppHeader";

export const metadata = {
  title: "YÖK Tercih Asistanı",
  description:
    "YÖK Atlas verileriyle üniversite programlarını karşılaştırın ve tercih listenizi hazırlayın.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="h-full scroll-smooth">
      <body className="min-h-full bg-slate-900 text-slate-200 antialiased selection:bg-cyan-400/25 selection:text-cyan-50 [&_input]:w-full [&_input]:min-h-12 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-700 [&_input]:bg-slate-900 [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:text-slate-100 [&_input]:shadow-sm [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-slate-500 hover:[&_input]:border-slate-600 [&_input:focus]:border-cyan-400 [&_input:focus]:ring-4 [&_input:focus]:ring-cyan-400/15 [&_button:not(:disabled)]:cursor-pointer [&_a]:cursor-pointer [&_label]:cursor-pointer [&_summary]:cursor-pointer [&_select]:cursor-pointer [&_select]:appearance-none [&_select]:bg-none [&_select]:w-full [&_select]:min-h-12 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-700 [&_select]:bg-slate-900 [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:text-sm [&_select]:text-slate-100 [&_select]:shadow-sm [&_select]:outline-none [&_select]:transition hover:[&_select]:border-slate-600 [&_select:focus]:border-cyan-400 [&_select:focus]:ring-4 [&_select:focus]:ring-cyan-400/15 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border-slate-700 [&_textarea]:bg-slate-900 [&_textarea]:text-slate-100 [&_textarea]:shadow-sm [&_textarea:focus]:border-cyan-400 [&_textarea:focus]:ring-cyan-400/15">
        <AppProvider>
          <div className="min-h-screen">
            <AppHeader />
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
