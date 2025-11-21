import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { OrganizationSchema } from '@/components/organization-schema'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nexus.ai - Arquiteto de Soluções Completas | Plataformas Ponta-a-Ponta',
  description: 'Sistema Operacional de Vendas - A máquina que transforma tráfego em vendas qualificadas',
  url: 'https://n8nexus.com.br',
  openGraph: {
    title: "Nexus.ai - Arquiteto de Soluções Completas | Plataformas Ponta-a-Ponta",
    description: "Sistema Operacional de Vendas - A máquina que transforma tráfego em vendas qualificadas",
    url: 'https://n8nexus.com.br',
    siteName: 'Nexus.ai',
    images: [
      {
        url: 'https://n8nexus.com.br/Logo sem fundo.png',
        width: 1200,
        height: 630,
        alt: 'Nexus.ai - Arquiteto de Soluções Completas',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nexus.ai - Arquiteto de Soluções Completas | Plataformas Ponta-a-Ponta",
    description: "Sistema Operacional de Vendas - A máquina que transforma tráfego em vendas qualificadas",
    images: ['https://n8nexus.com.br/Logo sem fundo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <OrganizationSchema />
        {children}
      </body>
    </html>
  )
}

