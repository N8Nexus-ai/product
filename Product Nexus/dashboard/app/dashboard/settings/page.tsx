'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Bell,
  Shield,
  Save
} from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // TODO: Implementar salvamento de configurações
    setTimeout(() => {
      setLoading(false)
      alert('Configurações salvas com sucesso!')
    }, 1000)
  }

  return (
    <div className="p-8 min-h-screen bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-gray-400 mt-2">Gerencie as configurações da sua conta e empresa</p>
      </div>

      <div className="space-y-6">
        {/* Perfil do Usuário */}
        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <CardTitle className="text-white">Perfil do Usuário</CardTitle>
                <CardDescription className="text-gray-400">
                  Informações pessoais da sua conta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Nome</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Senha</label>
              <input
                type="password"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
        </Card>

        {/* Empresa */}
        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <CardTitle className="text-white">Informações da Empresa</CardTitle>
                <CardDescription className="text-gray-400">
                  Dados da sua empresa
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Nome da Empresa</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="Nome da empresa"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">CNPJ</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Setor</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="Ex: Energia Solar, Tecnologia, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <CardTitle className="text-white">Notificações</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure suas preferências de notificação
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-white font-medium">Email de notificações</label>
                <p className="text-xs text-gray-400">Receba notificações por email</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-white font-medium">Novos leads</label>
                <p className="text-xs text-gray-400">Notificar quando um novo lead for recebido</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-white font-medium">Leads qualificados</label>
                <p className="text-xs text-gray-400">Notificar quando um lead for qualificado</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <CardTitle className="text-white">Segurança</CardTitle>
                <CardDescription className="text-gray-400">
                  Configurações de segurança da conta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Alterar Senha</label>
              <input
                type="password"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="Nova senha"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Confirmar Senha</label>
              <input
                type="password"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="Confirme a nova senha"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  )
}

