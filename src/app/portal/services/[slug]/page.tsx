import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ServiceDetail } from './service-detail'

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('service_catalog')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!service) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile name
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user!.id)
    .single()

  const userName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : ''

  // Check if the user already has a case for this service
  const { data: existingCase } = await supabase
    .from('cases')
    .select('id, access_granted, intake_status')
    .eq('client_id', user!.id)
    .eq('service_id', service.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return <ServiceDetail service={service} userId={user!.id} existingCase={existingCase} userName={userName} />
}
