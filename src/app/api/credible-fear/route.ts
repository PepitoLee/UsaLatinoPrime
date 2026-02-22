import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

const credibleFearSchema = z.object({
  // 1. Info personal
  full_name: z.string().min(2, 'Nombre requerido'),
  date_of_birth: z.string().min(1, 'Fecha de nacimiento requerida'),
  country_of_origin: z.string().min(2, 'Pais de origen requerido'),
  entry_date: z.string().min(1, 'Fecha de entrada requerida'),
  entry_method: z.string().min(2, 'Metodo de entrada requerido'),

  // 2. Motivo de salida
  reason_for_leaving: z.string().min(10, 'Describa su motivo de salida'),

  // 3. Eventos de persecucion
  who_harmed: z.string().min(2, 'Indique quien le hizo dano'),
  what_happened: z.string().min(10, 'Describa que paso'),
  when_happened: z.string().min(2, 'Indique cuando paso'),
  where_happened: z.string().min(2, 'Indique donde paso'),
  had_witnesses: z.boolean().default(false),
  witnesses_detail: z.string().optional().default(''),
  has_evidence: z.boolean().default(false),
  evidence_detail: z.string().optional().default(''),

  // 4. Proteccion en su pais
  went_to_police: z.boolean().default(false),
  why_not_police: z.string().optional().default(''),
  police_response: z.string().optional().default(''),

  // 5. Temor actual
  fear_if_return: z.string().min(10, 'Describa su temor'),
  who_would_look: z.string().min(2, 'Indique quien lo buscaria'),
  still_receiving_threats: z.boolean().default(false),
  threats_detail: z.string().optional().default(''),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = credibleFearSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('credible_fear_submissions')
      .insert(parsed.data)

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Error al guardar el formulario' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Formulario enviado exitosamente' },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
