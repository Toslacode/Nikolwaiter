import type { Metadata, Viewport } from "next";
import { Assistant, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-assistant",
  display: "swap",
});

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-frank",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nikol",
  description: "המלצרית החכמה שלכם",
  // App/tab icon only — the in-screen branding stays the arch-and-wheat mark
  // from the approved references.
  icons: {
    icon: "/icons/ICON.png",
    apple: "/icons/ICON.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FBF8F5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} ${frank.variable}`}>
      <body>{children}</body>
    </html>
  );
}
