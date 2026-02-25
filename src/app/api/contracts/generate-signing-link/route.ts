import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  try {
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

    const { contract_id } = await request.json()
    if (!contract_id) {
      return NextResponse.json({ error: 'contract_id requerido' }, { status: 400 })
    }

    const token = crypto.randomUUID()
    const service = createServiceClient()

    const { error } = await service
      .from('contracts')
      .update({ signing_token: token, status: 'pendiente_firma' })
      .eq('id', contract_id)

    if (error) {
      console.error('Error generating signing link:', error)
      return NextResponse.json({ error: 'Error al generar enlace' }, { status: 500 })
    }

    const origin = new URL(request.url).origin
    const url = `${origin}/contrato/${token}`

    return NextResponse.json({ token, url }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
