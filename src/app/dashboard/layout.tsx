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
      <main className="  flex-1 w-full pt-20 pb-20 px-4 lg:pl-72 lg:pb-8">
        <div className="max-w-7xl mx-auto w-full">
          {children}
          </div>
        </main>
      </div>

      {/* Footer fixo (mesmo da landing) */}
      <Footer />
    </ProtectedRoute>
  );
}