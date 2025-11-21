import { Sidebar } from '@/components/sidebar'
import { AnimatedBackground } from '@/components/animated-background'
import { FloatingChat } from '@/components/floating-chat'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0D0D0D] relative">
      <AnimatedBackground />
      <div className="relative" style={{ zIndex: 50 }}>
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto relative" style={{ zIndex: 10 }}>
        {children}
      </main>
      <FloatingChat />
    </div>
  )
}

