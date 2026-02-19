'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CreditCard, Loader2, CheckCircle, Clock, AlertTriangle,
  MessageCircle, ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800' },
  overdue: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
}

interface PortalPaymentsViewProps {
  payments: any[]
}

interface CaseGroup {
  caseId: string
  caseNumber: string
  serviceName: string
  serviceSlug: string
  totalCost: number
  payments: any[]
  totalPaid: number
  totalPending: number
  progress: number
}

export function PortalPaymentsView({ payments }: PortalPaymentsViewProps) {
  const [payingId, setPayingId] = useState<string | null>(null)

  const caseGroups: CaseGroup[] = useMemo(() => {
    const grouped = new Map<string, any[]>()
    for (const p of payments) {
      const caseId = p.case_id || 'unknown'
      if (!grouped.has(caseId)) grouped.set(caseId, [])
      grouped.get(caseId)!.push(p)
    }

    return Array.from(grouped.entries()).map(([caseId, casePayments]) => {
      const first = casePayments[0]
      const totalPaid = casePayments
        .filter(p => p.status === 'completed')
        .reduce((s, p) => s + Number(p.amount), 0)
      const totalPending = casePayments
        .filter(p => p.status === 'pending')
        .reduce((s, p) => s + Number(p.amount), 0)
      const totalCost = totalPaid + totalPending

      return {
        caseId,
        caseNumber: first.case?.case_number || '',
        serviceName: first.case?.service?.name || 'Servicio',
        serviceSlug: first.case?.service?.slug || '',
        totalCost,
        payments: casePayments.sort((a, b) => a.installment_number - b.installment_number),
        totalPaid,
        totalPending,
        progress: totalCost > 0 ? (totalPaid / totalCost) * 100 : 0,
      }
    })
  }, [payments])

  const globalTotalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((s, p) => s + Number(p.amount), 0)

  const globalPendingCount = payments.filter(p => p.status === 'pending').length

  const nextPending = payments.find(p => p.status === 'pending' && p.due_date)

  async function handlePayInstallment(payment: any) {
    setPayingId(payment.id)
    try {
      const serviceName = payment.case?.service?.name || 'Servicio'
      const serviceSlug = payment.case?.service?.slug || ''

      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: payment.case_id,
          service_name: serviceName,
          variant_label: '',
          total_price: Number(payment.amount) * Number(payment.total_installments),
          installments: payment.total_installments > 1,
          installment_number: payment.installment_number,
          total_installments: payment.total_installments,
          service_slug: serviceSlug,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se recibio URL de pago')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el pago')
    } finally {
      setPayingId(null)
    }
  }

  if (payments.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Sin pagos registrados</h3>
            <p className="text-gray-500 mt-1 text-sm">
              Cuando realice pagos por sus servicios, apareceran aqui con su historial completo.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>

      {/* Global Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Pagado</p>
              <p className="text-xl font-bold text-gray-900">${globalTotalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cuotas Pendientes</p>
              <p className="text-xl font-bold text-gray-900">{globalPendingCount}</p>
            </div>
          </CardContent>
        </Card>
        {nextPending && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Proximo Vencimiento</p>
                <p className="text-sm font-semibold text-gray-900">
                  {format(new Date(nextPending.due_date), "d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Per-Case Groups */}
      {caseGroups.map((group) => (
        <Card key={group.caseId} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#002855] to-[#003570] text-white pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">{group.serviceName}</CardTitle>
                {group.caseNumber && (
                  <p className="text-sm text-blue-200/70 mt-0.5">Caso #{group.caseNumber}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">${group.totalCost.toLocaleString()}</p>
                <p className="text-xs text-blue-200/70">Total del servicio</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-emerald-300">Pagado: ${group.totalPaid.toLocaleString()}</span>
                <span className="text-yellow-300">Restante: ${group.totalPending.toLocaleString()}</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(group.progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-blue-200/50 mt-1">
                {Math.round(group.progress)}% completado
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y">
              {group.payments.map((payment) => {
                const isOverdue = payment.status === 'pending' && payment.due_date && new Date(payment.due_date) < new Date()
                const displayStatus = isOverdue ? 'overdue' : payment.status
                const info = statusConfig[displayStatus] || statusConfig.pending
                const isNextPending = payment.status === 'pending' && !group.payments.some(
                  (p) => p.status === 'pending' && p.installment_number < payment.installment_number
                )

                return (
                  <div
                    key={payment.id}
                    className={`flex items-center justify-between px-4 py-3 ${
                      isOverdue ? 'bg-red-50/50' : isNextPending ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : isOverdue
                          ? 'bg-red-100 text-red-700'
                          : isNextPending
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {payment.installment_number}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Cuota {payment.installment_number} de {payment.total_installments}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.status === 'completed' && payment.paid_at
                            ? `Pagado el ${format(new Date(payment.paid_at), "d MMM yyyy", { locale: es })}`
                            : payment.due_date
                            ? `Vence: ${format(new Date(payment.due_date), "d MMM yyyy", { locale: es })}`
                            : ''
                          }
                          {payment.payment_method && payment.status === 'completed'
                            ? ` — ${payment.payment_method}`
                            : ''
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className={`text-sm font-semibold ${
                        payment.status === 'completed' ? 'text-green-700' : 'text-gray-900'
                      }`}>
                        ${Number(payment.amount).toLocaleString()}
                      </p>
                      <Badge className={info.color}>{info.label}</Badge>

                      {payment.status === 'pending' && isNextPending && (
                        <Button
                          size="sm"
                          onClick={() => handlePayInstallment(payment)}
                          disabled={payingId === payment.id}
                          className="bg-[#002855] hover:bg-[#003570] ml-1"
                        >
                          {payingId === payment.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <CreditCard className="w-3 h-3 mr-1" />
                          )}
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* WhatsApp fallback */}
            {group.payments.some(p => p.status === 'pending') && (
              <div className="px-4 py-3 bg-gray-50 border-t">
                <a
                  href={`https://wa.me/18019413479?text=${encodeURIComponent(`Hola Henry, quiero pagar mi cuota de ${group.serviceName}. Caso #${group.caseNumber}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:text-[#20BD5A] font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Pagar por WhatsApp / Zelle / Efectivo
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
