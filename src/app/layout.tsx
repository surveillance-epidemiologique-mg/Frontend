import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider/component";
import { ToastProvider } from "@/components/toast/component";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Surveillance Épidémiologique — Madagascar",
  description:
    "Plateforme nationale de surveillance épidémiologique de Madagascar.",
  icons: {
    icon: "/logo-p.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`h-full antialiased ${montserrat.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const stored = localStorage.getItem("episuivi-theme");
                const dark = stored === "dark" ||
                  (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
                document.documentElement.classList.toggle("dark", dark);
                document.documentElement.style.colorScheme = dark ? "dark" : "light";
              } catch (_) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
