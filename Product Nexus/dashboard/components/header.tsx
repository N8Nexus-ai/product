"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useContact } from "@/contexts/contact-context"
import Link from "next/link"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { openContactModal } = useContact()

  return (
    <header className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img 
                src="/Logo sem fundo.png" 
                alt="Nexus.ai Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-10">
            <a href="/#servicos" className="font-medium text-base tracking-wider relative group">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:from-primary hover:to-indigo-400 transition-all duration-300">Serviços</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a href="/#processo" className="font-medium text-base tracking-wider relative group">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:from-primary hover:to-indigo-400 transition-all duration-300">Como Funciona</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <Link href="/blog" className="font-medium text-base tracking-wider relative group">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:from-primary hover:to-indigo-400 transition-all duration-300">Blog</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link href="/sobre" className="font-medium text-base tracking-wider relative group">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:from-primary hover:to-indigo-400 transition-all duration-300">Sobre Nós</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Button 
              className="font-bold tracking-wide text-base px-6 py-3 bg-gradient-to-r from-primary to-indigo-400 hover:from-primary/90 hover:to-indigo-400/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0"
              onClick={openContactModal}
            >
              Agendar Conversa
            </Button>
          </nav>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X size={24} className="text-foreground" /> : <Menu size={24} className="text-foreground" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-6">
              <a href="/#servicos" className="font-medium text-lg tracking-wider py-3 relative group">
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:from-primary hover:to-indigo-400 transition-all duration-300 relative z-10">Serviços</span>
                <div className="absolute left-0 top-0 w-0 h-full bg-primary/10 transition-all duration-300 group-hover:w-full rounded-md"></div>
              </a>
              <a href="/#processo" className="font-medium text-lg tracking-wider py-3 relative group">
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:from-primary hover:to-indigo-400 transition-all duration-300 relative z-10">Como Funciona</span>
                <div className="absolute left-0 top-0 w-0 h-full bg-primary/10 transition-all duration-300 group-hover:w-full rounded-md"></div>
              </a>
              <Link href="/blog" className="font-medium text-lg tracking-wider py-3 relative group">
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:from-primary hover:to-indigo-400 transition-all duration-300 relative z-10">Blog</span>
                <div className="absolute left-0 top-0 w-0 h-full bg-primary/10 transition-all duration-300 group-hover:w-full rounded-md"></div>
              </Link>
              <Link href="/sobre" className="font-medium text-lg tracking-wider py-3 relative group">
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:from-primary hover:to-indigo-400 transition-all duration-300 relative z-10">Sobre Nós</span>
                <div className="absolute left-0 top-0 w-0 h-full bg-primary/10 transition-all duration-300 group-hover:w-full rounded-md"></div>
              </Link>
              <Button 
                className="w-full font-bold tracking-wide text-lg px-6 py-4 bg-gradient-to-r from-primary to-indigo-400 hover:from-primary/90 hover:to-indigo-400/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 mt-4"
                onClick={openContactModal}
              >
                Agendar Conversa
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
