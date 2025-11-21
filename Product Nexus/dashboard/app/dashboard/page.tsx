'use client'

import { useEffect, useState } from 'react'
import { analytics } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatCurrency } from '@/lib/utils'
import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Send,
  Target,
  Activity,
  DollarSign,
  Bot,
  Sparkles,
  Calendar,
  ChevronDown
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [funnel, setFunnel] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Calcular datas baseadas no período selecionado
  const getDateRange = () => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    
    const start = new Date()
    
    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 7)
        break
      case '30d':
        start.setDate(start.getDate() - 30)
        break
      case '90d':
        start.setDate(start.getDate() - 90)
        break
      case 'custom':
        if (startDate && endDate) {
          return {
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString()
          }
        }
        // Fallback para 30 dias se custom não estiver preenchido
        start.setDate(start.getDate() - 30)
        break
    }
    
    start.setHours(0, 0, 0, 0)
    
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [period, startDate, endDate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const dateRange = getDateRange()
      
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }

      const [metricsRes, funnelRes, timelineRes, sourcesRes] = await Promise.all([
        analytics.getDashboard(params),
        analytics.getFunnel(params),
        analytics.getTimeline({ groupBy: 'day', ...params }),
        analytics.getSources(params)
      ])

      setMetrics(metricsRes.data.data)
      setFunnel(funnelRes.data.data)
      setTimeline(timelineRes.data.data.slice(-7))
      setSources(sourcesRes.data.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (value: '7d' | '30d' | '90d' | 'custom') => {
    setPeriod(value)
    if (value !== 'custom') {
      setStartDate('')
      setEndDate('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const overview = metrics?.overview || {}

  return (
    <div className="p-8 min-h-screen bg-transparent">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Visão geral do seu funil de vendas</p>
        </div>
        
        {/* Seletor de Período */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value as '7d' | '30d' | '90d' | 'custom')}
              className="px-4 py-2 bg-[#0D0D0D] border border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white text-sm appearance-none cursor-pointer pr-8"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="custom">Período personalizado</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
          </div>
          
          {/* Seletor de Data Customizado */}
          {period === 'custom' && (
            <Card className="absolute right-0 mt-2 bg-[#1A1A1A] border border-0 shadow-xl z-10 w-64">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Data Inicial</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate || undefined}
                      className="w-full px-3 py-2 bg-[#0D0D0D] border border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Data Final</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-[#0D0D0D] border border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#1A1A1A] border-0 hover:bg-[#1F1F1F] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total de Leads</CardTitle>
            <Users className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatNumber(overview.totalLeads || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Leads recebidos no período
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-0 hover:bg-[#1F1F1F] transition-all relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-gray-300">Leads Qualificados</CardTitle>
              <div className="group relative">
                <Bot className="h-4 w-4 text-purple-400 cursor-help" />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1a1a1a] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-0 shadow-lg z-50">
                  Avaliado com Inteligência Artificial (Gemini)
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a1a1a]"></div>
                </div>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatNumber(overview.qualifiedLeads || 0)}</div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Avaliado com Inteligência Artificial
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Taxa de qualificação: <span className="text-green-400 font-medium">{overview.qualificationRate}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-0 hover:bg-[#1F1F1F] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Enviados ao CRM</CardTitle>
            <Send className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatNumber(overview.sentToCrm || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Integração automática
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-0 hover:bg-[#1F1F1F] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Taxa de Conversão</CardTitle>
            <Target className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{overview.conversionRate}</div>
            <p className="text-xs text-gray-500 mt-1">
              Leads convertidos em vendas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Funnel Chart */}
        <Card className="bg-[#1A1A1A] border-0 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Funil de Conversão</CardTitle>
            <CardDescription className="text-gray-400">Progressão dos leads pelo funil</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Timeline Chart */}
        <Card className="bg-[#1A1A1A] border-0 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Leads nos Últimos 7 Dias</CardTitle>
            <CardDescription className="text-gray-400">Volume diário de leads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
                <Line type="monotone" dataKey="qualified" stroke="#10b981" name="Qualificados" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sources Performance */}
      <Card className="bg-[#1A1A1A] border-0">
        <CardHeader>
          <CardTitle className="text-white">Performance por Fonte</CardTitle>
          <CardDescription className="text-gray-400">Análise de leads por origem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-0">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Fonte</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Total</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Qualificados</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Taxa Qual.</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Score Médio</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source: any, index: number) => (
                  <tr key={index} className="border-b border-0 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 capitalize text-white">{source.source}</td>
                    <td className="text-right py-3 px-4 text-white">{formatNumber(source.totalLeads)}</td>
                    <td className="text-right py-3 px-4 text-white">{formatNumber(source.qualifiedLeads)}</td>
                    <td className="text-right py-3 px-4 text-green-400 font-medium">{source.qualificationRate}</td>
                    <td className="text-right py-3 px-4 text-blue-400 font-medium">{source.averageScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

