import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database'

const VALID_STATUSES: AppointmentStatus[] = ['completed', 'no_show', 'cancelled']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { appointment_id, status } = await request.json()

  if (!appointment_id || !status) {
    return NextResponse.json({ error: 'appointment_id y status requeridos' }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointment_id)

  if (error) {
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
