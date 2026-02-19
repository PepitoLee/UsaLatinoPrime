import { createClient } from '@/lib/supabase/server'
import { AdminPaymentsDashboard } from './admin-payments-dashboard'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('*, case:cases(case_number, service_id, service:service_catalog(name, slug)), client:profiles(first_name, last_name, email)')
    .order('created_at', { ascending: false })

  const { data: cases } = await supabase
    .from('cases')
    .select('id, case_number, client_id, service_id, total_cost, service:service_catalog(name, slug), client:profiles(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AdminPaymentsDashboard
      initialPayments={payments || []}
      cases={cases || []}
    />
  )
}
