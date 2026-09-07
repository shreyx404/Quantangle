import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

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
        {children}
      </body>
    </html>
  );
}
