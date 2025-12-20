"use client";

// Ícones
import { Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import LoginModal from "@/components/LoginModal/page";

/* 
  MENU — organizado com ID e LABEL,
  pois IDs não podem ter acentos nem espaços.
*/
const menu = [
  { label: "Sobre", id: "sobre" },
  { label: "Serviços", id: "servicos" },
  { label: "Como usar", id: "como_usar" },
  { label: "Contato", id: "contato" },

];


export const Header = () => {
// Estado do modal de login
    const [openLogin, setOpenLogin] = useState(false);

  // Estado do menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  

  // Estado que define se a página está scrollada para mudar o header
  const [isScrolled, setIsScrolled] = useState(false);

  /* 
    Detecta o scroll para mudar o estilo do header 
    (efeito de glassmorphism ao rolar a página)
  */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /*
    Faz a rolagem suave até a seção desejada
    e fecha o menu mobile ao clicar.
  */
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
${isScrolled
  ? "bg-black/90 backdrop-blur-md shadow-xl border-b border-purple-900/20"
  : "bg-transparent"}


      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center py-4">
          
          {/* LOGO */}
          <Link
           href={"/"}
           className="flex items-center space-x-2">
            <Sparkles
              className={`w-8 h-8 transition-all duration-300 ${
                isScrolled ? "text-purple-600" : "text-purple-700"
              }`}
            />

            {/* Gradiente no texto */}
            <h1       
              className={`
                text-2xl font-black bg-gradient-to-r from-purple-600 to-purple-900
                bg-clip-text text-transparent transition-all duration-300
              `}
            >
              kraven
            </h1>
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex space-x-8">
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`
                  capitalize font-medium transition-all duration-300 relative group
                  ${isScrolled
                    ? "text-gray-600 hover:text-purple-600"
                    : "text-white hover:text-purple-200"}
                `}
              >
                {item.label}

                {/* Underline animado */}
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5
                    bg-gradient-to-r from-purple-600 to-pink-600
                    transition-all duration-300 group-hover:w-full"
                />
              </button>
            ))}
            <div
            className="">
              <Button
              onClick={() => setOpenLogin(true)}
              variant="primary">
             Começar Agora
              </Button>
              <LoginModal
              open={openLogin}
              onClose={() => setOpenLogin(false)}
              />
              </div>
          </nav>

          {/* BOTÃO MENU MOBILE */}
          <button
            className=" bg-purple-900 md:hidden p-2 rounded-lg transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MENU MOBILE (somente quando aberto) */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl mt-2
              py-6 border border-purple-100"
          >
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-6 py-3 text-gray-700
                  hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600
                  capitalize font-medium transition-all duration-300"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
