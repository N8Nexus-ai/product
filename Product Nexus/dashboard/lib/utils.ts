import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getLeadStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    NEW: 'bg-blue-100 text-blue-800',
    ENRICHING: 'bg-purple-100 text-purple-800',
    ENRICHED: 'bg-indigo-100 text-indigo-800',
    SCORING: 'bg-yellow-100 text-yellow-800',
    QUALIFIED: 'bg-green-100 text-green-800',
    UNQUALIFIED: 'bg-red-100 text-red-800',
    SENT_TO_CRM: 'bg-teal-100 text-teal-800',
    CONVERTED: 'bg-emerald-100 text-emerald-800',
    LOST: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getLeadStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    NEW: 'Novo',
    ENRICHING: 'Enriquecendo',
    ENRICHED: 'Enriquecido',
    SCORING: 'Qualificando',
    QUALIFIED: 'Qualificado',
    UNQUALIFIED: 'Não Qualificado',
    SENT_TO_CRM: 'Enviado ao CRM',
    CONVERTED: 'Convertido',
    LOST: 'Perdido',
  }
  return labels[status] || status
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente'
  if (score >= 60) return 'Bom'
  if (score >= 40) return 'Regular'
  return 'Baixo'
}

