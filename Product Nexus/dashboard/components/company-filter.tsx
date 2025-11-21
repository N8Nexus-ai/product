'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Building2 } from 'lucide-react'
import { api } from '@/lib/api'

interface Company {
  id: string
  name: string
}

interface CompanyFilterProps {
  selectedCompanyId?: string
  onCompanyChange: (companyId: string | undefined) => void
  className?: string
}

export function CompanyFilter({ selectedCompanyId, onCompanyChange, className = '' }: CompanyFilterProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await api.get('/companies')
      setCompanies(response.data.data || [])
      
      // Se não tem empresa selecionada e há empresas, seleciona a primeira
      if (!selectedCompanyId && response.data.data?.length > 0) {
        onCompanyChange(undefined) // Todas as empresas
      }
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedCompany = companies.find(c => c.id === selectedCompanyId)
  const displayText = selectedCompany ? selectedCompany.name : 'Todas as empresas'

  if (loading) {
    return (
      <div className={`relative inline-block ${className}`}>
        <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-2 rounded-lg border border-white/10 w-fit">
          <Building2 className="w-4 h-4 text-gray-400 animate-pulse" />
          <span className="text-gray-400 text-sm">Carregando...</span>
        </div>
      </div>
    )
  }

  if (companies.length === 0) {
    return null
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-2 rounded-lg border border-white/10 hover:border-primary/50 transition-colors w-fit min-w-[200px]"
      >
        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-white text-sm truncate">{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-20 min-w-[200px] max-w-[300px] overflow-hidden">
            <button
              onClick={() => {
                onCompanyChange(undefined)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-[#0D0D0D] transition-colors ${
                !selectedCompanyId ? 'bg-primary/20 text-primary font-medium' : 'text-gray-300'
              }`}
            >
              Todas as empresas
            </button>
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => {
                  onCompanyChange(company.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-[#0D0D0D] transition-colors border-t border-white/5 ${
                  selectedCompanyId === company.id ? 'bg-primary/20 text-primary font-medium' : 'text-gray-300'
                }`}
              >
                <div className="truncate">{company.name}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

