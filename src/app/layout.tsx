import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import MockModeBar from "@/components/MockModeBar";
import CartDrawer from "@/components/public/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { isMockMode, getCurrentAuthUser, getSiteSettings } from "@/lib/data";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary selection:bg-accent selection:text-bg-primary">
        <CartProvider>
          {children}
          <CartDrawer
            session={session}
            whatsappNumber={settings.contact_whatsapp || "+919837755055"}
          />
        </CartProvider>
        <MockModeBar initialRole={session.role} isMock={isMock} />
      </body>
    </html>
  );
}
