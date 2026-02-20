import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { caseId, formData, currentStep } = await request.json()

    if (!caseId || formData === undefined) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // Verify the case belongs to this user
    const { data: caseData } = await supabase
      .from('cases')
      .select('id, client_id')
      .eq('id', caseId)
      .eq('client_id', user.id)
      .single()

    if (!caseData) {
      return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 })
    }

    const { error } = await supabase
      .from('cases')
      .update({
        form_data: formData,
        current_step: currentStep ?? 0,
      })
      .eq('id', caseId)

    if (error) {
      console.error('Autosave API error:', error)
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Autosave API error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
