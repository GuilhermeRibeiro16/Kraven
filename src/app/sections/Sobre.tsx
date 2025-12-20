"use client";

import { useState } from "react";
import LoginModal from "../../components/LoginModal/page";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

import { ArrowRight, Play } from "lucide-react";

export default function Sobre() {
      const [openLogin, setOpenLogin] = useState(false);

    return (
    <section
    id="sobre"
    className="  min-h-screen flex items-center relative overflow-hidden bg-[url(https://cdn.pixabay.com/photo/2017/08/02/20/43/laptop-2573318_1280.jpg)] bg-no-repeat bg-cover "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div className="lg:grid lg:grid-cols-2 lg:gap-35 items-center">
          <div className="mb-12 lg:mb-0">
            {/* badge */}
            <Badge variant="primary">
                     Acesse sua conta para começar
             </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Veja além.{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r
              from-purple-800 via-purple-600 to-purple-400">
                domine
              </span>
              seu territorio
              <br />
              <span className="block text-transparent bg-clip-text bg-gradient-to-r
              from-green-800 via-green-600 to-green-400">
                financeiro.
              </span>
            </h1>

            <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-lg">
              {" "}
              Domine suas finanças com Kraven: sua ferramenta definitiva para
              controle, análise e crescimento financeiro.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
              onClick={() => setOpenLogin(true)}
              variant="primary">
            <ArrowRight className="mr-2" /> Começar Agora
              </Button>
              <LoginModal
              open={openLogin}
              onClose={() => setOpenLogin(false)}
              />

              <Button 
              href="https://www.youtube.com/watch?v=Kz7m9wJyQhM&list=PLfko_q81EM0vT31p9HDi6aT0DyMebCHsY&index=9"
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer">
                <Play size={20} className="mr-2 group-hover:scale-110 transition-transform
                duration-300 " />
                Assista como usar
              </Button>
            </div>
            {/* convencer */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">2+ </div>
                <div className="text-gray-300 text-sm">Anos de Mercado</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">100% </div>
                <div className="text-gray-300 text-sm">Satisfação</div>
              </div>
             <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">24/7 </div>
                <div className="text-gray-300 text-sm">Suporte</div>
              </div>
            </div>
          </div>
                      {/* barra lado */}
             <div className="relative">
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border
            border-white/20 shadow-2xl">
              <div className="absolute -top-4 -right-4 w-4 h-8 bg-gradient-to-r 
              from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>

              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl
                backdrop-blur-sm ">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500
                  rounded-xl flex items-center justify-center ">
                    <span className="text-white font-bold">rapido</span>
                  </div>
              
                <div>
                  <h3 className="text-white font-semibold">Painel Inteligente</h3>
                    <p className="text-gray-300 text-sm">Controle completo das suas operações em um só lugar.</p>      
                </div>
                <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl
                backdrop-blur-sm ">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500
                  rounded-2xl flex items-center justify-center backdrop-blur-sm ">
                    <span className="text-white font-bold">emp</span>
                  </div>
              
                <div>
                  <h3 className="text-white font-semibold">Emprestimo</h3>
                    <p className="text-gray-300 text-sm">Soluções rápidas, seguras e escaláveis para o seu negócio.</p>
                   
                  
                </div>
                <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl
                backdrop-blur-sm ">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500
                  rounded-2xl flex items-center justify-center backdrop-blur-sm ">
                    <span className="text-white font-bold">SEC</span>
                  </div>
              
                <div>
                  <h3 className="text-white font-semibold">Segurança</h3>
                    <p className="text-gray-300 text-sm">protejemos seus dados</p>   
                </div>
                <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
                </div>
            </div>
             </div>
        </div>
      </div>

</section>
    )
}