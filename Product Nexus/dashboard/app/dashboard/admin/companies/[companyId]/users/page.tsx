'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { users, auth, companies } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  User,
  Users as UsersIcon,
  Building2,
  Save,
  X
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'CLIENT' | 'USER'
  companyId: string | null
  active: boolean
  createdAt: string
  company: {
    id: string
    name: string
  } | null
}

interface CompanyData {
  id: string
  name: string
}

export default function CompanyUsersPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string

  const [usersData, setUsersData] = useState<UserData[]>([])
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserData>>({})
  const [isNexus, setIsNexus] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (userRole === 'ADMIN' && companyId) {
      loadCompany()
    }
  }, [userRole, companyId])

  const checkAccess = async () => {
    try {
      const response = await auth.getCurrentUser()
      const user = response.data.data
      setUserRole(user.role)

      if (user.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error checking access:', error)
      router.push('/login')
    }
  }

  const loadCompany = async () => {
    try {
      const response = await companies.get(companyId)
      const companyData = response.data.data
      setCompany(companyData)
      const isNexusCompany = companyData.name.toLowerCase().includes('nexus')
      setIsNexus(isNexusCompany)
      // Após carregar empresa, carregar usuários
      await loadUsers(isNexusCompany)
    } catch (error) {
      console.error('Error loading company:', error)
    }
  }

  const loadUsers = async (nexusCompany?: boolean) => {
    try {
      setLoading(true)
      
      // Buscar usuários da empresa
      const response = await users.list({ companyId })
      let usersList = response.data.data || []
      
      // Se for a empresa Nexus, também buscar ADMINs sem companyId
      const isNexusCompany = nexusCompany !== undefined ? nexusCompany : isNexus
      
      if (isNexusCompany) {
        try {
          const allUsersResponse = await users.list() // Sem companyId, retorna todos incluindo ADMINs
          const allUsers = allUsersResponse.data.data || []
          
          // Filtrar apenas ADMINs sem companyId
          const nexusAdmins = allUsers.filter((u: UserData) => 
            u.role === 'ADMIN' && !u.companyId
          )
          
          // Combinar usuários da empresa com ADMINs sem companyId
          const existingIds = new Set(usersList.map((u: UserData) => u.id))
          const uniqueNexusAdmins = nexusAdmins.filter((u: UserData) => !existingIds.has(u.id))
          
          usersList = [...usersList, ...uniqueNexusAdmins]
        } catch (error) {
          console.error('Error loading Nexus admins:', error)
        }
      }
      
      setUsersData(usersList)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user.id)
    setEditForm({
      name: user.name || '',
      role: user.role,
      active: user.active
    })
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({})
  }

  const handleSaveEdit = async (userId: string) => {
    try {
      await users.update(userId, editForm)
      await loadUsers(isNexus)
      setEditingUser(null)
      setEditForm({})
    } catch (error: any) {
      console.error('Error updating user:', error)
      alert(error.response?.data?.message || 'Erro ao atualizar usuário')
    }
  }

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário ${userEmail}?`)) {
      return
    }

    try {
      await users.delete(userId)
      await loadUsers(isNexus)
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(error.response?.data?.message || 'Erro ao deletar usuário')
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      CLIENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      USER: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return colors[role as keyof typeof colors] || colors.USER
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      ADMIN: 'Administrador',
      CLIENT: 'Cliente',
      USER: 'Usuário'
    }
    return labels[role as keyof typeof labels] || role
  }

  if (!userRole || userRole !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
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
          <p className="mt-4 text-gray-400">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-transparent">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/admin')}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Painel Admin
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold text-white">{company?.name}</h1>
              {isNexus && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Empresa de Admins
                </Badge>
              )}
            </div>
            <p className="text-gray-400 mt-2">Gerenciamento de usuários da empresa</p>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{usersData.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {usersData.filter(u => u.active).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              {usersData.filter(u => u.role === 'ADMIN').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Apenas nesta empresa</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {usersData.filter(u => u.active).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {usersData.filter(u => !u.active).length} inativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuários */}
      <Card className="bg-[#1A1A1A] border-0">
        <CardHeader>
          <CardTitle className="text-white">Usuários da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Email</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Role</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Criado em</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {editingUser === user.id ? (
                      <>
                        <td className="py-4 px-4">
                          <input
                            type="text"
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white text-sm"
                            placeholder="Nome"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-400 text-sm">{user.email}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <select
                            value={editForm.role || user.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                            className="px-3 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white text-sm"
                            disabled={isNexus && user.role === 'ADMIN' && !user.companyId}
                          >
                            <option value="USER">Usuário</option>
                            <option value="CLIENT">Cliente</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                          {isNexus && user.role === 'ADMIN' && !user.companyId && (
                            <p className="text-xs text-purple-400 mt-1">Admin da Nexus não pode ser alterado</p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <select
                            value={editForm.active !== undefined ? editForm.active.toString() : user.active.toString()}
                            onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                            className="px-3 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white text-sm"
                          >
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(user.id)}
                              className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="text-gray-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4">
                          <div className="text-gray-100 font-medium">{user.name || '-'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300 text-sm">{user.email}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className={getRoleBadge(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge
                            className={
                              user.active
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                          >
                            {user.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(user)}
                              className="text-gray-400 hover:text-primary"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!(isNexus && user.role === 'ADMIN' && !user.companyId) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(user.id, user.email)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {usersData.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum usuário encontrado para esta empresa.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

