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
  DollarSign
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do seu funil de vendas</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.totalLeads || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Leads recebidos no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Qualificados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.qualifiedLeads || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de qualificação: {overview.qualificationRate}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados ao CRM</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.sentToCrm || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Integração automática
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.conversionRate}</div>
            <p className="text-xs text-muted-foreground">
              Leads convertidos em vendas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Funnel Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Progressão dos leads pelo funil</CardDescription>
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
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Leads nos Últimos 7 Dias</CardTitle>
            <CardDescription>Volume diário de leads</CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle>Performance por Fonte</CardTitle>
          <CardDescription>Análise de leads por origem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Fonte</th>
                  <th className="text-right py-3 px-4 font-medium">Total</th>
                  <th className="text-right py-3 px-4 font-medium">Qualificados</th>
                  <th className="text-right py-3 px-4 font-medium">Taxa Qual.</th>
                  <th className="text-right py-3 px-4 font-medium">Score Médio</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 capitalize">{source.source}</td>
                    <td className="text-right py-3 px-4">{formatNumber(source.totalLeads)}</td>
                    <td className="text-right py-3 px-4">{formatNumber(source.qualifiedLeads)}</td>
                    <td className="text-right py-3 px-4">{source.qualificationRate}</td>
                    <td className="text-right py-3 px-4">{source.averageScore}</td>
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

