import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { supabase: null, error: 'No autorizado', status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { supabase: null, error: 'No autorizado', status: 403 }

  return { supabase, error: null, status: 200 }
}

export async function GET() {
  const { supabase, error, status } = await verifyAdmin()
  if (!supabase) return NextResponse.json({ error }, { status })

  const { data } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('blocked_date', { ascending: true })

  return NextResponse.json({ blocked_dates: data || [] })
}

export async function POST(request: NextRequest) {
  const { supabase, error, status } = await verifyAdmin()
  if (!supabase) return NextResponse.json({ error }, { status })

  const { blocked_date, reason } = await request.json()

  if (!blocked_date) {
    return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })
  }

  const { data, error: insertError } = await supabase
    .from('blocked_dates')
    .insert({ blocked_date, reason })
    .select()
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'Esta fecha ya está bloqueada' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al bloquear fecha' }, { status: 500 })
  }

  return NextResponse.json({ blocked_date: data })
}

export async function DELETE(request: NextRequest) {
  const { supabase, error, status } = await verifyAdmin()
  if (!supabase) return NextResponse.json({ error }, { status })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const { error: deleteError } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: 'Error al desbloquear fecha' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
