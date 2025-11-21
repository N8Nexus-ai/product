import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0D0D0D]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#0D0D0D]">
        {children}
      </main>
    </div>
  )
}

