import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getAvailableSlots } from '@/lib/appointments/slots'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const date = request.nextUrl.searchParams.get('date')

  if (!token || !date) {
    return NextResponse.json({ error: 'Token y fecha requeridos' }, { status: 400 })
  }

  // Validar formato de fecha
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Validar token
  const { data: tokenData } = await supabase
    .from('appointment_tokens')
    .select('client_id, case_id, is_active')
    .eq('token', token)
    .single()

  if (!tokenData || !tokenData.is_active) {
    return NextResponse.json({ error: 'Token inválido o inactivo' }, { status: 403 })
  }

  // Verificar si la fecha está bloqueada
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('blocked_date', date)
    .single()

  if (blocked) {
    return NextResponse.json({ slots: [], blocked: true })
  }

  // Obtener config de horarios
  const { data: config } = await supabase
    .from('scheduling_config')
    .select('*')

  // Obtener settings
  const { data: settings } = await supabase
    .from('scheduling_settings')
    .select('*')
    .single()

  // Obtener citas existentes para esa fecha
  const dayStart = `${date}T00:00:00Z`
  const dayEnd = `${date}T23:59:59Z`

  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('id, scheduled_at, duration_minutes, status')
    .eq('status', 'scheduled')
    .gte('scheduled_at', dayStart)
    .lte('scheduled_at', dayEnd)

  const slots = getAvailableSlots(
    date,
    config || [],
    (existingAppointments || []).map(a => a as never),
    settings?.slot_duration_minutes || 60
  )

  return NextResponse.json({ slots })
}
