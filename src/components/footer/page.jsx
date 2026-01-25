"use client";

import { ArrowUp, Facebook, InstagramIcon, Linkedin, Mail, MapPin, Phone, PhoneCall, Sparkles } from "lucide-react";
import Button from "../ui/Button";

const company = [
  "Sobre nós",
  "Carreiras",
  "Blog",
  "Imprensa",
];

const services = [
  "Consultoria Financeira",
  "Planejamento de Aposentadoria",
  "Gestão de Investimentos",
  "Planejamento Tributário",
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        {/* AQUI ERA "REGHT" — corrigido para RIGHT */}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* LOGO / SOCIAIS */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-pink-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>

              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Kraven
              </h3>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              Transforme sua vida financeira com Kraven: controle total, decisões inteligentes e liberdade financeira ao seu alcance.
            </p>

            <div className="flex space-x-4">
              <a href="" className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="" className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300">
                <Linkedin size={18} />
              </a>
              <a href="" className="w-10 h-10 bg-gradient-to-r from-pink-600 to-red-500 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300">
                <InstagramIcon size={18} />
              </a>
              <a href="" className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300">
                <PhoneCall size={18} />
              </a>
            </div>
          </div>

          {/* SERVIÇOS */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Serviços</h4>
            <ul className="space-y-3">
              {services.map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-300 hover:text-purple-400 transition-all duration-300 flex items-center group">
                    {/* ERRADO: item estava DENTRO do span */}
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-105 transition-all duration-300"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* EMPRESA */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Empresa</h4>
            <ul className="space-y-3">
              {company.map((com, comindex) => (
                <li key={comindex}>
                  <a href="#" className="text-gray-300 hover:text-purple-400 transition-all duration-300 flex items-center group">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-105 transition-all duration-300"></span>
                    {com}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTATO */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Get in touch</h4>

            <div className="space-y-4">

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail size={18} />
                </div>
                <p className="text-white font-medium">guilherme.ribeiro1617.com</p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone size={18} />
                </div>
                <p className="text-white font-medium">+55 (82) 91234-5678</p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <p className="text-white font-medium">AL - Domingos Firmino 1233</p>
              </div>

            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm mb-4 md:mb-0">
            &copy; 2024 Kraven. Todos os direitos reservados. / privacidade / termos de serviços / cookies
          </p>
        </div>

        {/* BOTÃO VOLTAR AO TOPO */}
        <button
          className="  w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 mt-8"
          onClick={scrollToTop}
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </footer>
  );
}
