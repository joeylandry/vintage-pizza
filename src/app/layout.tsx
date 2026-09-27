import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: {
    default: "Vintage Pizza · Manchester, NH · Order Online",
    template: "%s · Vintage Pizza",
  },
  description:
    "Vintage Pizza on Candia Rd in Manchester, NH. Best pizza, hand-breaded chicken tenders and wings since 2014. Order online for pickup or delivery.",
  openGraph: {
    title: "Vintage Pizza · Manchester, NH",
    description: "Best pizza, best tenders, best wings. Order online for pickup or delivery.",
    images: ["/images/hero-wide.webp"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#16120f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
            Skip to content
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
