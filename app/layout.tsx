import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Couplii",
  description: "Vztahový pomocník do kapsy",
  manifest: "/manifest.json",
  icons: {
    icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="central" text-anchor="middle" font-size="100">❤️‍🔥</text></svg>`,
  },
};

export const viewport: Viewport = {
  themeColor: "#9e0000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
