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
      <body className="min-h-full flex flex-col bg-[#080b14] text-[#f0f4f8] selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
