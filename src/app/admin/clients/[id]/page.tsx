import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ClientCasesTable } from './client-cases-table'

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

  const [casesRes, paymentsRes] = await Promise.all([
    supabase
      .from('cases')
      .select('id, case_number, intake_status, access_granted, created_at, service:service_catalog(name, slug)')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select('id, case_id, amount, status, payment_method, installment_number, total_installments, paid_at, created_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
  ])

  const clientCases = casesRes.data || []
  const clientPayments = paymentsRes.data || []

  const casesWithPayment = new Set(
    clientPayments.filter(p => p.status === 'completed').map(p => p.case_id)
  )

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

      {/* Cases Table with expandable payments */}
      <ClientCasesTable
        clientId={id}
        cases={clientCases}
        payments={clientPayments}
        casesWithPayment={casesWithPayment}
      />
    </div>
  )
}
