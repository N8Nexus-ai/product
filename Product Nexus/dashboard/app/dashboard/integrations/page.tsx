'use client'

import { useEffect, useState } from 'react'
import { integrations } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plug,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Settings
} from 'lucide-react'

export default function IntegrationsPage() {
  const [integrationsData, setIntegrationsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      setLoading(true)
      const response = await integrations.list()
      setIntegrationsData(response.data.data || [])
    } catch (error) {
      console.error('Error loading integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta integração?')) {
      return
    }

    try {
      await integrations.remove(id)
      loadIntegrations()
    } catch (error) {
      console.error('Error removing integration:', error)
    }
  }

  if (loading && integrationsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando integrações...</p>
        </div>
      </div>
    )
  }

  const integrationTypes = [
    { type: 'CRM_PIPEDRIVE', label: 'Pipedrive', color: 'bg-blue-100 text-blue-800' },
    { type: 'CRM_RD_STATION', label: 'RD Station', color: 'bg-purple-100 text-purple-800' },
    { type: 'CRM_HUBSPOT', label: 'HubSpot', color: 'bg-orange-100 text-orange-800' },
    { type: 'CRM_SALESFORCE', label: 'Salesforce', color: 'bg-cyan-100 text-cyan-800' },
    { type: 'ADS_FACEBOOK', label: 'Facebook Ads', color: 'bg-blue-100 text-blue-800' },
    { type: 'ADS_GOOGLE', label: 'Google Ads', color: 'bg-red-100 text-red-800' },
    { type: 'ADS_LINKEDIN', label: 'LinkedIn Ads', color: 'bg-blue-100 text-blue-800' },
    { type: 'FORM_TYPEFORM', label: 'Typeform', color: 'bg-pink-100 text-pink-800' },
    { type: 'MESSAGING_WHATSAPP', label: 'WhatsApp', color: 'bg-green-100 text-green-800' },
    { type: 'EMAIL_SENDGRID', label: 'SendGrid', color: 'bg-indigo-100 text-indigo-800' },
  ]

  const getIntegrationLabel = (type: string) => {
    const integration = integrationTypes.find(i => i.type === type)
    return integration?.label || type
  }

  const getIntegrationColor = (type: string) => {
    const integration = integrationTypes.find(i => i.type === type)
    return integration?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8 min-h-screen bg-transparent">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Integrações</h1>
          <p className="text-gray-400 mt-2">Gerencie suas integrações com plataformas externas</p>
        </div>
        <Button onClick={() => {}}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      {/* Integrations Grid */}
      {integrationsData.length === 0 ? (
        <Card className="bg-[#1A1A1A] border-0">
          <CardContent className="pt-12 pb-12 text-center">
            <Plug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma integração encontrada</h3>
            <p className="text-gray-400 mb-6">
              Comece conectando suas plataformas favoritas
            </p>
            <Button onClick={() => {}}>
              <Plus className="h-4 w-4 mr-2" />
              Conectar Primeira Integração
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationsData.map((integration: any) => (
            <Card key={integration.id} className="bg-[#1A1A1A] border-0 hover:bg-[#1F1F1F] transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white">{integration.name}</CardTitle>
                    <Badge className={`mt-2 ${getIntegrationColor(integration.type)}`}>
                      {getIntegrationLabel(integration.type)}
                    </Badge>
                  </div>
                  <Badge className={integration.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {integration.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integration.lastSync && (
                    <div className="text-sm text-gray-400">
                      Última sincronização: {new Date(integration.lastSync).toLocaleDateString('pt-BR')}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {}}
                      className="flex-1"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(integration.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

