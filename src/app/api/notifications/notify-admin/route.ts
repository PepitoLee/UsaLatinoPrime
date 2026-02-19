import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { case_id, title, message, type } = await request.json()

  if (!case_id || !title || !message) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  // Use service client to bypass RLS
  const serviceClient = createServiceClient()

  const { data: admins } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)

  if (!admins?.[0]) {
    return NextResponse.json({ error: 'No se encontro admin' }, { status: 404 })
  }

  const { error } = await serviceClient.from('notifications').insert({
    user_id: admins[0].id,
    case_id,
    title,
    message,
    type: type || 'payment',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
