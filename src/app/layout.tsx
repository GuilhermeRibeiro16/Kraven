import "./globals.css";
import { Metadata, Viewport } from "next";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Kraven",
  description:
    "Kraven é a ferramenta definitiva para controle, análise e crescimento financeiro. Domine suas finanças com facilidade e eficiência.",
  openGraph: {
    title: "Kraven",
    description: "Domine suas finanças",
    images: ["https://sujeitoprogramador.com/steve.png"],
  },
};

// ✨ ADICIONE ISSO AQUI
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}