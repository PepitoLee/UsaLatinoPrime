import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortalPaymentsView } from './portal-payments-view'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: payments } = await supabase
    .from('payments')
    .select('*, case:cases(id, case_number, total_cost, service_id, service:service_catalog(name, slug))')
    .eq('client_id', user.id)
    .order('installment_number', { ascending: true })

  return <PortalPaymentsView payments={payments || []} />
}
