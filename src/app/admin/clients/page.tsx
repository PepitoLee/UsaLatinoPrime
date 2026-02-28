import { createClient } from '@/lib/supabase/server'
import { ClientsList } from './clients-list'

export default async function AdminClientsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, created_at, cases(count)')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  const clients = (data || []).map((c: any) => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
    email: c.email,
    phone: c.phone || '',
    created_at: c.created_at,
    case_count: c.cases?.[0]?.count ?? 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <span className="text-sm text-gray-500">{clients.length} registrados</span>
      </div>
      <ClientsList initialClients={clients} />
    </div>
  )
}
