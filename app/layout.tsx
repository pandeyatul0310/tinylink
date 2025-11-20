import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TinyLink - URL Shortener",
  description: "Shorten URLs and track clicks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="bg-blue-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">TinyLink</h1>
            <p className="text-sm text-blue-100">URL Shortener Service</p>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-800 text-white mt-12">
          <div className="container mx-auto px-4 py-6 text-center">
            <p className="text-sm">&copy; 2024 TinyLink. Built with Next.js</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
