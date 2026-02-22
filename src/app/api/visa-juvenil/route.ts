import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

const visaJuvenilSchema = z.object({
  // 1. Info del menor
  minor_first_name: z.string().min(2, 'Nombre requerido'),
  minor_last_name: z.string().min(2, 'Apellido requerido'),
  minor_middle_name: z.string().optional().default(''),
  minor_dob: z.string().min(1, 'Fecha de nacimiento requerida'),
  minor_age: z.number().min(0).max(20, 'Edad debe ser menor de 21'),
  minor_gender: z.string().min(1, 'Sexo requerido'),
  minor_country_of_birth: z.string().min(2, 'Pais de nacimiento requerido'),
  minor_nationality: z.string().min(2, 'Nacionalidad requerida'),
  minor_native_language: z.string().min(2, 'Idioma nativo requerido'),
  minor_speaks_english: z.boolean().default(false),
  minor_current_address: z.string().min(2, 'Direccion requerida'),
  minor_city: z.string().min(2, 'Ciudad requerida'),
  minor_state: z.string().min(2, 'Estado requerido'),
  minor_zip: z.string().min(2, 'Codigo postal requerido'),
  minor_phone: z.string().optional().default(''),
  minor_email: z.string().optional().default(''),
  minor_entry_date: z.string().min(1, 'Fecha de entrada requerida'),
  minor_entry_manner: z.string().min(1, 'Manera de entrada requerida'),
  minor_a_number: z.string().optional().default(''),
  minor_in_removal: z.boolean().default(false),
  minor_current_guardian: z.string().min(2, 'Guardian requerido'),
  minor_guardian_relationship: z.string().min(1, 'Relacion con guardian requerida'),
  minor_school_enrolled: z.boolean().default(false),
  minor_school_name: z.string().optional().default(''),
  minor_grade: z.string().optional().default(''),

  // 2. Info de los padres
  father_first_name: z.string().optional().default(''),
  father_last_name: z.string().optional().default(''),
  father_dob: z.string().optional().default(''),
  father_country_of_birth: z.string().optional().default(''),
  father_location: z.string().optional().default(''),
  father_relationship_status: z.string().optional().default(''),
  father_abuse_neglect: z.boolean().default(false),
  father_abuse_details: z.string().optional().default(''),
  mother_first_name: z.string().optional().default(''),
  mother_last_name: z.string().optional().default(''),
  mother_dob: z.string().optional().default(''),
  mother_country_of_birth: z.string().optional().default(''),
  mother_location: z.string().optional().default(''),
  mother_relationship_status: z.string().optional().default(''),
  mother_abuse_neglect: z.boolean().default(false),
  mother_abuse_details: z.string().optional().default(''),
  parents_marital_status: z.string().optional().default(''),
  reunification_viable: z.boolean().default(false),
  reunification_explanation: z.string().min(10, 'Explique la reunificacion'),

  // 3. Historia de abuso
  abuse_types: z.string().min(2, 'Seleccione tipos de maltrato'),
  abuse_narrative: z.string().min(20, 'Describa el abuso con detalle'),
  abuse_start_date: z.string().min(1, 'Indique cuando comenzo'),
  abuse_ongoing: z.string().min(1, 'Indique si continua'),
  abuse_reported: z.boolean().default(false),
  abuse_report_details: z.string().optional().default(''),
  therapy_received: z.boolean().default(false),
  therapy_details: z.string().optional().default(''),
  state_court_involved: z.boolean().default(false),
  state_court_details: z.string().optional().default(''),
  state_court_state: z.string().optional().default(''),
  best_interest_in_us: z.string().min(20, 'Explique por que debe quedarse en EE.UU.'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = visaJuvenilSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('visa_juvenil_submissions')
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
