'use client'

import { useEffect, useState } from 'react'
import { analytics } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AnalyticsPage() {
  const [roi, setRoi] = useState<any>(null)
  const [quality, setQuality] = useState<any>(null)
  const [sources, setSources] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const [roiRes, qualityRes, sourcesRes, timelineRes] = await Promise.all([
        analytics.getROI(),
        analytics.getLeadQuality(),
        analytics.getSources(),
        analytics.getTimeline({ groupBy: 'week' })
      ])

      setRoi(roiRes.data.data)
      setQuality(qualityRes.data.data)
      setSources(sourcesRes.data.data)
      setTimeline(timelineRes.data.data.slice(-8)) // Last 8 weeks
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-2">Análise detalhada de performance</p>
      </div>

      {/* ROI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#1A1A1A] border-white/10 hover:border-white/20 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Investimento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {roi ? formatCurrency(parseFloat(roi.totalSpend)) : '-'}
            </div>
            <p className="text-xs text-gray-500">Em campanhas</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10 hover:border-white/20 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Custo por Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {roi ? formatCurrency(parseFloat(roi.costPerLead)) : '-'}
            </div>
            <p className="text-xs text-gray-500">CPL médio</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10 hover:border-white/20 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Custo por Qualificado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {roi ? formatCurrency(parseFloat(roi.costPerQualified)) : '-'}
            </div>
            <p className="text-xs text-gray-500">CPQ médio</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/10 hover:border-white/20 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {roi?.roi || '0%'}
            </div>
            <p className="text-xs text-gray-500">Retorno sobre investimento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Score Distribution */}
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Distribuição de Score</CardTitle>
            <CardDescription className="text-gray-400">Qualidade dos leads por faixa de pontuação</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={quality?.scoreDistribution || []}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {(quality?.scoreDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sources Comparison */}
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Comparação de Fontes</CardTitle>
            <CardDescription className="text-gray-400">Volume de leads por origem</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalLeads" fill="#3b82f6" name="Total" />
                <Bar dataKey="qualifiedLeads" fill="#10b981" name="Qualificados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="mb-8 bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Evolução Semanal</CardTitle>
          <CardDescription className="text-gray-400">Tendência de leads ao longo do tempo</CardDescription>
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
              <Line type="monotone" dataKey="converted" stroke="#8b5cf6" name="Convertidos" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Performance de Campanhas</CardTitle>
          <CardDescription className="text-gray-400">Detalhamento por campanha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Campanha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Fonte</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Investimento</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Leads</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">CPL</th>
                </tr>
              </thead>
              <tbody>
                {(roi?.campaigns || []).map((campaign: any, index: number) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{campaign.name}</td>
                    <td className="py-3 px-4 capitalize text-white">{campaign.source}</td>
                    <td className="text-right py-3 px-4 text-white">
                      {formatCurrency(campaign.spend)}
                    </td>
                    <td className="text-right py-3 px-4 text-white">{formatNumber(campaign.leads)}</td>
                    <td className="text-right py-3 px-4 text-white">
                      {formatCurrency(parseFloat(campaign.costPerLead))}
                    </td>
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

