'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { companies, analytics, leads, agents } from '@/lib/api'
import { auth } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatCurrency } from '@/lib/utils'
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle,
  Users as UsersIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompanyData {
  id: string
  name: string
  cnpj: string | null
  industry: string | null
  active: boolean
  setupStatus: string
  createdAt: string
  _count: {
    users: number
    leads: number
  }
  metrics?: {
    totalLeads: number
    qualifiedLeads: number
    convertedLeads: number
    averageScore: number
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [companiesData, setCompaniesData] = useState<CompanyData[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (userRole === 'ADMIN') {
      loadCompanies()
    }
  }, [userRole, selectedCompanyId])

  const checkAccess = async () => {
    try {
      const response = await auth.getCurrentUser()
      const user = response.data.data
      setUserRole(user.role)

      if (user.role !== 'ADMIN') {
        // Redirecionar usuários não-admin
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error checking access:', error)
      router.push('/login')
    }
  }

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await companies.list()
      const companiesList = response.data.data || []

      // Carregar métricas para cada empresa
      const companiesWithMetrics = await Promise.all(
        companiesList.map(async (company: CompanyData) => {
          try {
            const metricsRes = await analytics.getDashboard({ companyId: company.id })
            const metrics = metricsRes.data.data?.overview || {}

            return {
              ...company,
              metrics: {
                totalLeads: metrics.totalLeads || company._count.leads || 0,
                qualifiedLeads: metrics.qualifiedLeads || 0,
                convertedLeads: metrics.converted || 0,
                averageScore: metrics.averageScore || 0
              }
            }
          } catch (error) {
            console.error(`Error loading metrics for ${company.name}:`, error)
            return {
              ...company,
              metrics: {
                totalLeads: company._count.leads || 0,
                qualifiedLeads: 0,
                convertedLeads: 0,
                averageScore: 0
              }
            }
          }
        })
      )

      setCompaniesData(companiesWithMetrics)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userRole || userRole !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Acesso negado. Apenas ADMINs podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando dados...</p>
        </div>
      </div>
    )
  }

  const totalLeads = companiesData.reduce((sum, c) => sum + (c.metrics?.totalLeads || 0), 0)
  const totalQualified = companiesData.reduce((sum, c) => sum + (c.metrics?.qualifiedLeads || 0), 0)
  const totalConverted = companiesData.reduce((sum, c) => sum + (c.metrics?.convertedLeads || 0), 0)
  const totalUsers = companiesData.reduce((sum, c) => sum + c._count.users, 0)

  return (
    <div className="p-8 min-h-screen bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
        <p className="text-gray-400 mt-2">Visão geral de todas as empresas no sistema</p>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Total de Empresas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{companiesData.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {companiesData.filter(c => c.active).length} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Em todas as empresas</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Leads Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatNumber(totalLeads)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalQualified} qualificados ({totalLeads > 0 ? ((totalQualified / totalLeads) * 100).toFixed(1) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Convertidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatNumber(totalConverted)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Taxa de conversão: {totalQualified > 0 ? ((totalConverted / totalQualified) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Empresas */}
      <Card className="bg-[#1A1A1A] border-0">
        <CardHeader>
          <CardTitle className="text-white">Empresas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Empresa</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">CNPJ</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Setor</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Usuários</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Leads</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Qualificados</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Convertidos</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Score Médio</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {companiesData.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td 
                      className="py-4 px-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCompanyId(company.id)
                        router.push(`/dashboard?companyId=${company.id}`)
                      }}
                    >
                      <div className="text-gray-100 font-medium">{company.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">
                      {company.cnpj || '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">
                      {company.industry || '-'}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-100 font-medium">
                      {company._count.users}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-100 font-medium">
                      {formatNumber(company.metrics?.totalLeads || 0)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-green-400 font-medium">
                        {formatNumber(company.metrics?.qualifiedLeads || 0)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-blue-400 font-medium">
                        {formatNumber(company.metrics?.convertedLeads || 0)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-100 font-medium">
                      {company.metrics?.averageScore 
                        ? parseFloat(company.metrics.averageScore.toString()).toFixed(1)
                        : '-'
                      }
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        className={
                          company.active
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {company.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <Badge
                        className={`ml-2 ${
                          company.setupStatus === 'completed'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : company.setupStatus === 'in_progress'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {company.setupStatus === 'completed' 
                          ? 'Completo' 
                          : company.setupStatus === 'in_progress'
                          ? 'Em Progresso'
                          : 'Pendente'
                        }
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/admin/companies/${company.id}/users`)
                        }}
                        className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
                      >
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Ver Contas
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {companiesData.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma empresa cadastrada ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

