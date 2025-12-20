import { Header } from "@/components/header/page";
import Footer from "@/components/footer/page";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}