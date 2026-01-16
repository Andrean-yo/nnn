import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "IndraScans - Baca Manhwa Terlengkap & Terupdate Bahasa Indonesia",
    description: "Tempat baca Manhwa, Manga, dan Manhua terupdate setiap hari dengan kualitas gambar HD dan loading cepat. Nikmati ribuan judul komik favoritmu hanya di IndraScans!",
    keywords: ["baca manhwa", "manhwa indo", "komik update", "indrascans", "manhwa reader", "baca manga"],
    authors: [{ name: "IndraScans Team" }],
    openGraph: {
        title: "IndraScans - Baca Manhwa Update Setiap Hari",
        description: "Baca komik manhwa terlengkap dengan kualitas terbaik hanya di IndraScans.",
        url: "https://indrascans.vercel.app",
        siteName: "IndraScans",
        type: "website",
    },
    robots: {
        index: true,
        follow: true,
    },
    verification: {
        google: "K_rxGxvfFLlK3ou7yw-OrxHoMrw16V1Je8G0UTDEgLQ",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
