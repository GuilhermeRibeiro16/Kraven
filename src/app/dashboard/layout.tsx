import DashboardHeader from "@/components/headers/DashboardHeader";
import Sidebar from "@/components/sidebar/Sidebar";
import Footer from "@/components/footer/page";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {/* Header do Dashboard */}
      <DashboardHeader />

      <div className="flex min-h-screen">
        {/* Sidebar - Desktop (esquerda) e Mobile (bottom) */}
        <Sidebar />

        {/* Conteúdo principal */}
        <main className="flex-1 pt-24 pb-20 px-4 md:pl-72 md:pb-8">
          {children}
        </main>
      </div>

      {/* Footer fixo (mesmo da landing) */}
      <Footer />
    </ProtectedRoute>
  );
}