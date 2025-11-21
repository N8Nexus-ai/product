'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedBackground } from '@/components/animated-background'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await auth.login(email, password)
      const { token } = response.data.data

      localStorage.setItem('token', token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] px-4 relative">
      <AnimatedBackground />
      <Card className="w-full max-w-md bg-[#1A1A1A]/90 backdrop-blur-sm border-white/10 relative z-10 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center space-y-4">
            {/* Logo - Adicione sua logo em public/logo.png */}
            <div className="relative w-48 h-16">
              <Image 
                src="/logo.png" 
                alt="Nexus Sales OS" 
                fill
                className="object-contain"
                onError={(e) => {
                  // Se a logo não existir, mostra o texto
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <CardTitle className="text-3xl font-bold text-center" style={{ display: 'none' }}>
              Nexus Sales OS
            </CardTitle>
            <CardDescription className="text-center">
              Sistema Operacional de Vendas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-gray-500"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-gray-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6 text-base rounded-lg shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Usuário padrão:</p>
            <p className="mt-2 text-gray-400">
              <strong className="text-gray-300">Email:</strong> admin@nexus.ai<br />
              <strong className="text-gray-300">Senha:</strong> Admin123!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

