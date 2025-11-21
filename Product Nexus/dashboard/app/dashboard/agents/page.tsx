'use client'

import { useEffect, useState } from 'react'
import { agents } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  getAgentStatusColor,
  getAgentStatusLabel,
  getAgentTypeLabel,
  formatDateTime
} from '@/lib/utils'
import {
  Search,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Activity
} from 'lucide-react'

export default function AgentsPage() {
  const [agentsData, setAgentsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadAgents()
  }, [page, statusFilter])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const response = await agents.list({
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search })
      })

      setAgentsData(response.data.data.agents)
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      console.error('Error loading agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadAgents()
  }

  const handleStatusChange = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await agents.updateStatus(id, newStatus)
      loadAgents()
    } catch (error) {
      console.error('Error updating agent status:', error)
    }
  }

  const handleExecute = async (id: string) => {
    try {
      const response = await agents.execute(id, { prompt: 'Olá! Você está funcionando? Responda brevemente.' })
      console.log('Agent execution result:', response.data)
      alert('Agente executado com sucesso! Verifique o console para ver o resultado.')
      loadAgents()
    } catch (error: any) {
      console.error('Error executing agent:', error)
      alert(`Erro ao executar agente: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agente?')) {
      return
    }

    try {
      await agents.delete(id)
      loadAgents()
    } catch (error) {
      console.error('Error deleting agent:', error)
    }
  }

  if (loading && agentsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando agentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agentes</h1>
          <p className="text-gray-600 mt-2">Gerencie seus agentes de automação (n8n)</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agente
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou descrição..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos os Status</option>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="PAUSED">Pausado</option>
                <option value="ERROR">Erro</option>
              </select>

              <Button variant="outline" onClick={loadAgents}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      {agentsData.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agente encontrado</h3>
            <p className="text-gray-600 mb-6">
              Comece criando seu primeiro agente de automação usando n8n
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Agente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentsData.map((agent: any) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <Badge className="mt-2" variant="outline">
                      {getAgentTypeLabel(agent.type)}
                    </Badge>
                  </div>
                  <Badge className={getAgentStatusColor(agent.status)}>
                    {getAgentStatusLabel(agent.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {agent.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {agent.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Execuções:</span>
                    <span className="font-medium">{agent.executionCount}</span>
                  </div>
                  {agent.lastExecutedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Última execução:</span>
                      <span className="font-medium">
                        {formatDateTime(agent.lastExecutedAt)}
                      </span>
                    </div>
                  )}
                  {agent.lastExecutionStatus && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge
                        className={
                          agent.lastExecutionStatus === 'success'
                            ? 'bg-green-100 text-green-800'
                            : agent.lastExecutionStatus === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {agent.lastExecutionStatus === 'success'
                          ? 'Sucesso'
                          : agent.lastExecutionStatus === 'error'
                          ? 'Erro'
                          : 'Executando'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {agent.status === 'ACTIVE' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(agent.id, agent.status)}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(agent.id, agent.status)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Ativar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExecute(agent.id)}
                    disabled={agent.status !== 'ACTIVE'}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/agents/${agent.id}`}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(agent.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      {/* Create Modal (Simple version - can be enhanced later) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Criar Novo Agente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                A funcionalidade completa de criação de agentes será implementada em breve.
                Por enquanto, você pode visualizar a estrutura dos agentes.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
