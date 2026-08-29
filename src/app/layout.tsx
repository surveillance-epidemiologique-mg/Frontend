import type { Metadata } from "next";
import { ThemeProvider } from "@/features/theme/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Surveillance Épidémiologique — Madagascar",
  description:
    "Plateforme nationale de surveillance épidémiologique de Madagascar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}