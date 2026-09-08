import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PwaManager } from "../components/pwa/PwaManager";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#060912",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Quantangle — Interactive AI-Guided Quantum Computing Platform",
  description:
    "Master quantum computing with real-time WebAssembly simulation, 3D Bloch spheres, bi-directional Qiskit synchronization, and verified AI guidance.",
  keywords: [
    "quantum computing",
    "qiskit",
    "quantum simulator",
    "bloch sphere",
    "openqasm",
    "webassembly",
    "quantum algorithms",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Quantangle",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060912] text-[#e2e8f0] selection:bg-cyan-500/25 selection:text-cyan-100">
        <PwaManager />
        {children}
      </body>
    </html>
  );
}
