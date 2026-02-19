import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortalDashboardView } from './portal-dashboard-view'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, casesRes, paymentsRes, notificationsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('cases')
      .select('*, service:service_catalog(name, slug, icon)')
      .eq('client_id', user.id)
      .neq('intake_status', 'cancelled')
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select('id, case_id, amount, due_date, status, installment_number, total_installments')
      .eq('client_id', user.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(5),
    supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_read', false),
  ])

  return (
    <PortalDashboardView
      userId={user.id}
      firstName={profileRes.data?.first_name || ''}
      lastName={profileRes.data?.last_name || ''}
      cases={casesRes.data || []}
      pendingPayments={paymentsRes.data || []}
      unreadNotifications={notificationsRes.data?.length || 0}
    />
  )
}
