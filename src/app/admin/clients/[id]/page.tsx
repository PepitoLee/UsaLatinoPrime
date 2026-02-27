import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { statusLabels as caseStatusLabels } from '@/lib/case-status'

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

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, created_at, role')
    .eq('id', id)
    .single()

  if (!profile || profile.role !== 'client') notFound()

  const { data: cases } = await supabase
    .from('cases')
    .select('id, case_number, intake_status, access_granted, created_at, service:service_catalog(name, slug)')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, status, payment_method, installment_number, total_installments, paid_at, created_at, case:cases(case_number)')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  const clientCases = cases || []
  const clientPayments = payments || []

  const totalPaid = clientPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const totalPending = clientPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/clients"
          className="mt-1 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.first_name} {profile.last_name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              {profile.email}
            </span>
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {profile.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Registrado {format(new Date(profile.created_at), "d MMM yyyy", { locale: es })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Pagado</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Pendiente</p>
            <p className="text-2xl font-bold text-yellow-600">
              ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Casos</p>
            <p className="text-2xl font-bold text-gray-900">{clientCases.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Casos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nro. Caso</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acceso</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No tiene casos registrados
                  </TableCell>
                </TableRow>
              ) : (
                clientCases.map((c) => {
                  const serviceRaw = c.service as unknown
                  const service = Array.isArray(serviceRaw) ? serviceRaw[0] as { name: string; slug: string } | undefined : serviceRaw as { name: string; slug: string } | null
                  const statusInfo = caseStatusLabels[c.intake_status] || { label: c.intake_status, color: 'bg-gray-100 text-gray-800' }
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link
                          href={`/admin/cases/${c.id}`}
                          className="font-medium text-blue-600 hover:underline"
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
                        <Badge variant="secondary" className={c.access_granted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {c.access_granted ? 'Sí' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(c.created_at), 'd MMM yyyy', { locale: es })}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caso</TableHead>
                <TableHead>Cuota</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha Pagado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No tiene pagos registrados
                  </TableCell>
                </TableRow>
              ) : (
                clientPayments.map((p) => {
                  const caseRaw = p.case as unknown
                  const caseInfo = Array.isArray(caseRaw) ? caseRaw[0] as { case_number: string } | undefined : caseRaw as { case_number: string } | null
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{caseInfo?.case_number || '—'}</TableCell>
                      <TableCell>
                        {p.installment_number && p.total_installments
                          ? `${p.installment_number}/${p.total_installments}`
                          : '—'}
                      </TableCell>
                      <TableCell>${(p.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={paymentStatusColors[p.status] || 'bg-gray-100 text-gray-800'}>
                          {paymentStatusLabels[p.status] || p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{p.payment_method || '—'}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {p.paid_at ? format(new Date(p.paid_at), 'd MMM yyyy', { locale: es }) : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
