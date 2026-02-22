import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

const childSchema = z.object({
  child_last_name: z.string().default(''),
  child_first_name: z.string().default(''),
  child_dob: z.string().default(''),
  child_gender: z.string().default(''),
  child_country_of_birth: z.string().default(''),
  child_nationality: z.string().default(''),
  child_a_number: z.string().default(''),
  child_in_us: z.boolean().default(false),
  child_include_in_application: z.boolean().default(false),
  child_marital_status: z.boolean().default(false),
})

const residenceSchema = z.object({
  res_address: z.string().default(''),
  res_city: z.string().default(''),
  res_country: z.string().default(''),
  res_from: z.string().default(''),
  res_to: z.string().default(''),
})

const employmentSchema = z.object({
  emp_employer: z.string().default(''),
  emp_address: z.string().default(''),
  emp_occupation: z.string().default(''),
  emp_from: z.string().default(''),
  emp_to: z.string().default(''),
})

const educationSchema = z.object({
  edu_school: z.string().default(''),
  edu_type: z.string().default(''),
  edu_location: z.string().default(''),
  edu_from: z.string().default(''),
  edu_to: z.string().default(''),
})

const siblingSchema = z.object({
  sibling_name: z.string().default(''),
  sibling_country_of_birth: z.string().default(''),
  sibling_deceased: z.boolean().default(false),
  sibling_current_location: z.string().default(''),
})

const countryVisitedSchema = z.object({
  country: z.string().default(''),
  duration: z.string().default(''),
  purpose: z.string().default(''),
})

const asiloSchema = z.object({
  // Step 1: Info Personal
  legal_last_name: z.string().min(2, 'Apellido requerido'),
  legal_first_name: z.string().min(2, 'Nombre requerido'),
  legal_middle_name: z.string().default(''),
  other_names: z.array(z.string()).default([]),
  residence_address_street: z.string().min(1, 'Direccion requerida'),
  residence_address_city: z.string().min(1, 'Ciudad requerida'),
  residence_address_state: z.string().min(1, 'Estado requerido'),
  residence_address_zip: z.string().min(1, 'Codigo postal requerido'),
  residence_phone: z.string().min(1, 'Telefono requerido'),
  mailing_same_as_residence: z.boolean().default(true),
  mailing_address: z.object({
    street: z.string().default(''),
    city: z.string().default(''),
    state: z.string().default(''),
    zip: z.string().default(''),
  }).optional(),
  gender: z.string().min(1, 'Sexo requerido'),
  marital_status: z.string().min(1, 'Estado civil requerido'),
  date_of_birth: z.string().min(1, 'Fecha de nacimiento requerida'),
  city_of_birth: z.string().min(1, 'Ciudad de nacimiento requerida'),
  country_of_birth: z.string().min(1, 'Pais de nacimiento requerido'),
  nationality: z.string().min(1, 'Nacionalidad requerida'),
  race_ethnicity: z.string().default(''),
  religion: z.string().default(''),
  native_language: z.string().min(1, 'Idioma nativo requerido'),
  speaks_english: z.boolean().default(false),
  other_languages: z.string().default(''),

  // Step 2: Info Inmigracion
  immigration_court_proceedings: z.boolean().default(false),
  last_entry_date: z.string().min(1, 'Fecha de entrada requerida'),
  i94_number: z.string().default(''),
  entry_status: z.string().min(1, 'Estatus de entrada requerido'),
  entry_status_other: z.string().default(''),
  entry_place: z.string().min(1, 'Lugar de entrada requerido'),
  status_expires: z.string().default(''),
  passport_number: z.string().default(''),
  passport_country: z.string().default(''),
  passport_expiry: z.string().default(''),
  travel_document_number: z.string().default(''),
  a_number: z.string().default(''),
  ssn: z.string().default(''),
  uscis_account: z.string().default(''),

  // Step 3: Conyuge e Hijos
  has_spouse: z.boolean().default(false),
  spouse_info: z.object({
    spouse_last_name: z.string().default(''),
    spouse_first_name: z.string().default(''),
    spouse_middle_name: z.string().default(''),
    spouse_other_names: z.string().default(''),
    spouse_dob: z.string().default(''),
    spouse_gender: z.string().default(''),
    spouse_nationality: z.string().default(''),
    spouse_a_number: z.string().default(''),
    spouse_ssn: z.string().default(''),
    spouse_in_us: z.boolean().default(false),
    spouse_include_in_application: z.boolean().default(false),
    spouse_immigration_status: z.string().default(''),
    marriage_date: z.string().default(''),
    marriage_place: z.string().default(''),
  }).optional(),
  has_children: z.boolean().default(false),
  children: z.array(childSchema).default([]),

  // Step 4: Historial
  last_address_before_us: z.object({
    street: z.string().default(''),
    city: z.string().default(''),
    state: z.string().default(''),
    country: z.string().default(''),
    from: z.string().default(''),
    to: z.string().default(''),
  }).optional(),
  residences_last_5_years: z.array(residenceSchema).default([]),
  employment_last_5_years: z.array(employmentSchema).default([]),
  education: z.array(educationSchema).default([]),
  mother_name: z.string().default(''),
  mother_country_of_birth: z.string().default(''),
  mother_deceased: z.boolean().default(false),
  mother_current_location: z.string().default(''),
  father_name: z.string().default(''),
  father_country_of_birth: z.string().default(''),
  father_deceased: z.boolean().default(false),
  father_current_location: z.string().default(''),
  siblings: z.array(siblingSchema).default([]),

  // Step 5: Persecucion
  persecution_grounds: z.array(z.string()).min(1, 'Seleccione al menos una base de persecucion'),
  past_harm: z.boolean().default(false),
  past_harm_description: z.string().default(''),
  fear_of_return: z.boolean().default(false),
  fear_description: z.string().default(''),
  harm_perpetrators: z.string().min(1, 'Indique quien le causo dano'),
  reported_to_authorities: z.boolean().default(false),
  authority_response: z.string().default(''),
  why_not_reported: z.string().default(''),
  organization_membership: z.string().default(''),
  continued_membership: z.boolean().default(false),

  // Step 6: Info Adicional
  prior_asylum_application: z.boolean().default(false),
  prior_asylum_details: z.string().default(''),
  arrested_detained: z.boolean().default(false),
  arrested_details: z.string().default(''),
  caused_harm: z.boolean().default(false),
  caused_harm_details: z.string().default(''),
  return_other_country: z.boolean().default(false),
  return_other_country_explanation: z.string().default(''),
  convention_against_torture: z.boolean().default(false),
  us_government_affiliation: z.boolean().default(false),
  us_government_details: z.string().default(''),

  // Step 7: Viajes
  travel_to_us: z.string().min(1, 'Describa su viaje'),
  countries_visited: z.array(countryVisitedSchema).default([]),
  applied_asylum_other_country: z.boolean().default(false),
  other_country_asylum_details: z.string().default(''),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = asiloSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('asilo_submissions')
      .insert({
        applicant_name: `${parsed.data.legal_first_name} ${parsed.data.legal_last_name}`,
        country_of_birth: parsed.data.country_of_birth,
        form_data: parsed.data,
      })

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
