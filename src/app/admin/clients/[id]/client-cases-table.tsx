'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { statusLabels as caseStatusLabels } from '@/lib/case-status'
import { GenerateLinkButton } from './generate-link-button'

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  overdue: 'bg-red-100 text-red-800',
  processing: 'bg-blue-100 text-blue-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const paymentStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  completed: 'Completado',
  failed: 'Fallido',
  overdue: 'Vencido',
  processing: 'Procesando',
  refunded: 'Reembolsado',
}

interface Payment {
  id: string
  case_id: string
  amount: number
  status: string
  payment_method: string
  installment_number: number
  total_installments: number
  paid_at: string | null
}

interface CaseData {
  id: string
  case_number: string
  intake_status: string
  access_granted: boolean
  created_at: string
  service: unknown
}

interface ClientCasesTableProps {
  clientId: string
  cases: CaseData[]
  payments: Payment[]
  casesWithPayment: Set<string>
}

export function ClientCasesTable({ clientId, cases, payments, casesWithPayment }: ClientCasesTableProps) {
  const [expandedCase, setExpandedCase] = useState<string | null>(null)

  function getPaymentsForCase(caseId: string) {
    return payments.filter(p => p.case_id === caseId)
  }

  function getPaymentProgress(caseId: string) {
    const casePayments = getPaymentsForCase(caseId)
    if (casePayments.length === 0) return null
    const paid = casePayments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0)
    const total = casePayments.reduce((s, p) => s + (p.amount || 0), 0)
    return { paid, total }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Casos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Nro. Caso</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No tiene casos registrados
                </TableCell>
              </TableRow>
            ) : (
              cases.map((c) => {
                const serviceRaw = c.service as unknown
                const service = Array.isArray(serviceRaw) ? serviceRaw[0] as { name: string; slug: string } | undefined : serviceRaw as { name: string; slug: string } | null
                const statusInfo = caseStatusLabels[c.intake_status] || { label: c.intake_status, color: 'bg-gray-100 text-gray-800' }
                const progress = getPaymentProgress(c.id)
                const isExpanded = expandedCase === c.id
                const casePayments = getPaymentsForCase(c.id)

                return (
                  <>
                    <TableRow
                      key={c.id}
                      className={`cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}
                      onClick={() => setExpandedCase(isExpanded ? null : c.id)}
                    >
                      <TableCell className="w-8 pr-0">
                        {casePayments.length > 0 && (
                          isExpanded
                            ? <ChevronDown className="w-4 h-4 text-gray-400" />
                            : <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/cases/${c.id}`}
                          className="font-medium text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {c.case_number}
                        </Link>
                      </TableCell>
                      <TableCell>{service?.name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {progress ? (
                          <span className={`text-sm font-medium ${progress.paid >= progress.total ? 'text-green-600' : 'text-gray-700'}`}>
                            ${progress.paid.toLocaleString()}/${progress.total.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(c.created_at), 'd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {casesWithPayment.has(c.id) && (
                          <GenerateLinkButton clientId={clientId} caseId={c.id} />
                        )}
                      </TableCell>
                    </TableRow>
                    {/* Expanded: payment installments */}
                    {isExpanded && casePayments.length > 0 && (
                      <TableRow key={`${c.id}-payments`}>
                        <TableCell colSpan={7} className="bg-gray-50/50 p-0">
                          <div className="px-8 py-3">
                            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Cuotas</p>
                            <div className="space-y-1.5">
                              {casePayments
                                .sort((a, b) => (a.installment_number || 0) - (b.installment_number || 0))
                                .map((p) => (
                                <div key={p.id} className="flex items-center gap-3 text-sm">
                                  <span className="text-gray-500 w-20">
                                    Cuota {p.installment_number}/{p.total_installments}
                                  </span>
                                  <span className="font-medium w-24">
                                    ${(p.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </span>
                                  <Badge variant="secondary" className={`${paymentStatusColors[p.status] || 'bg-gray-100 text-gray-800'} text-xs`}>
                                    {paymentStatusLabels[p.status] || p.status}
                                  </Badge>
                                  <span className="text-gray-400 capitalize text-xs">{p.payment_method || '—'}</span>
                                  <span className="text-gray-400 text-xs">
                                    {p.paid_at ? format(new Date(p.paid_at), 'd MMM yyyy', { locale: es }) : '—'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
