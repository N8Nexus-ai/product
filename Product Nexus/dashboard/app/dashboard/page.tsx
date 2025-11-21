'use client'

import { useEffect, useState } from 'react'
import { analytics } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Sparkles
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

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [metricsRes, funnelRes, timelineRes, sourcesRes] = await Promise.all([
        analytics.getDashboard(),
        analytics.getFunnel(),
        analytics.getTimeline({ groupBy: 'day' }),
        analytics.getSources()
      ])

      setMetrics(metricsRes.data.data)
      setFunnel(funnelRes.data.data)
      setTimeline(timelineRes.data.data.slice(-7)) // Last 7 days
      setSources(sourcesRes.data.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">Visão geral do seu funil de vendas</p>
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
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span>IA</span>
              </Badge>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatNumber(overview.qualifiedLeads || 0)}</div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Avaliado com Inteligência Artificial (Gemini)
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
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Fonte</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Total</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Qualificados</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Taxa Qual.</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Score Médio</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source: any, index: number) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
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

