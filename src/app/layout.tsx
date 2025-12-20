import "./globals.css";
import { Metadata } from "next";
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