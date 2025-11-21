'use client'

import { CompanyFilter } from './company-filter'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/api'

interface PageHeaderProps {
  title: string
  description?: string
  selectedCompanyId?: string
  onCompanyChange?: (companyId: string | undefined) => void
  className?: string
}

export function PageHeader({
  title,
  description,
  selectedCompanyId,
  onCompanyChange,
  className = ''
}: PageHeaderProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const response = await auth.getCurrentUser()
      const user = response.data.data
      setIsAdmin(user.role === 'ADMIN')
    } catch (error) {
      console.error('Error checking user role:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`mb-8 ${className}`}>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {description && <p className="text-gray-400 mt-2">{description}</p>}
      </div>
    )
  }

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {description && <p className="text-gray-400 mt-2">{description}</p>}
        </div>
        
        {isAdmin && onCompanyChange && (
          <CompanyFilter
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={onCompanyChange}
          />
        )}
      </div>
    </div>
  )
}

