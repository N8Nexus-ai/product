'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Plug,
  LogOut,
  Bot
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Agentes', href: '/dashboard/agents', icon: Bot },
  { name: 'Integrações', href: '/dashboard/integrations', icon: Plug },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col w-64 bg-[#0D0D0D] text-white border-r border-white/10">
      <div className="flex items-center justify-center h-20 border-b border-white/10 px-4 py-3">
        {/* Logo Nexus */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image 
            src="/logo-dark.png" 
            alt="Nexus Sales OS" 
            width={160} 
            height={50}
            className="object-contain max-w-full max-h-full"
            priority
            style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}

