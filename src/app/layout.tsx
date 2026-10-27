import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MockModeBar from "@/components/MockModeBar";
import CartDrawer from "@/components/public/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { isMockMode, getCurrentAuthUser, getSiteSettings } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "N.K. Ornaments | Wholesale German Silver Payal & Anklet Manufacturer",
  description:
    "Direct Mathura factory rates on premium German Silver payal, bridal anklets, antique oxidised designs, and wholesale ornaments with exact weight specifications for retail jewelers across India.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMock = isMockMode();
  const session = await getCurrentAuthUser();
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <CartProvider>
          {children}
          <CartDrawer
            session={session}
            whatsappNumber={settings.contact_whatsapp || "+919837012345"}
          />
        </CartProvider>
        <MockModeBar initialRole={session.role} isMock={isMock} />
      </body>
    </html>
  );
}

