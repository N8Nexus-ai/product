'use client'

import { useEffect, useState } from 'react'
import { leads } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  getLeadStatusColor,
  getLeadStatusLabel,
  getScoreColor,
  formatDateTime
} from '@/lib/utils'
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Send,
  Bot,
  Sparkles
} from 'lucide-react'

export default function LeadsPage() {
  const [leadsData, setLeadsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadLeads()
  }, [page, statusFilter])

  const loadLeads = async () => {
    try {
      setLoading(true)
      const response = await leads.list({
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search })
      })

      setLeadsData(response.data.data.leads)
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadLeads()
  }

  const handleEnrich = async (id: string) => {
    try {
      await leads.enrich(id)
      loadLeads()
    } catch (error) {
      console.error('Error enriching lead:', error)
    }
  }

  const handleSendToCrm = async (id: string) => {
    try {
      await leads.sendToCrm(id)
      loadLeads()
    } catch (error) {
      console.error('Error sending to CRM:', error)
    }
  }

  if (loading && leadsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Leads</h1>
        <p className="text-gray-400 mt-2">Gerencie todos os seus leads</p>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-[#1A1A1A] border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-gray-500"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </form>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-3 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
              >
                <option value="">Todos os Status</option>
                <option value="NEW">Novo</option>
                <option value="QUALIFIED">Qualificado</option>
                <option value="UNQUALIFIED">Não Qualificado</option>
                <option value="SENT_TO_CRM">Enviado ao CRM</option>
                <option value="CONVERTED">Convertido</option>
              </select>

              <Button variant="outline" onClick={loadLeads}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="bg-[#1A1A1A] border-0">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Lead</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Contato</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Fonte</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">Score</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Data</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {leadsData.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{lead.name || 'Sem nome'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {lead.email && <div className="text-gray-300">{lead.email}</div>}
                        {lead.phone && <div className="text-gray-500">{lead.phone}</div>}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-300">{lead.source}</td>
                    <td className="text-center py-3 px-4">
                      {lead.score ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className={`font-bold ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </span>
                          <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <Badge className={getLeadStatusColor(lead.status)}>
                          {getLeadStatusLabel(lead.status)}
                        </Badge>
                        {lead.status === 'QUALIFIED' && lead.score && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            Avaliado com IA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {formatDateTime(lead.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!lead.sentToCrm && lead.status === 'QUALIFIED' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendToCrm(lead.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

