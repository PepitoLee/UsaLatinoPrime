'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Play, CheckCircle, Loader2 } from 'lucide-react'

interface FormData {
  // 1. Info del menor
  minor_first_name: string
  minor_last_name: string
  minor_middle_name: string
  minor_dob: string
  minor_age: string
  minor_gender: string
  minor_country_of_birth: string
  minor_nationality: string
  minor_native_language: string
  minor_speaks_english: boolean
  minor_current_address: string
  minor_city: string
  minor_state: string
  minor_zip: string
  minor_phone: string
  minor_email: string
  minor_entry_date: string
  minor_entry_manner: string
  minor_a_number: string
  minor_in_removal: boolean
  minor_current_guardian: string
  minor_guardian_relationship: string
  minor_school_enrolled: boolean
  minor_school_name: string
  minor_grade: string

  // 2. Info de los padres
  father_first_name: string
  father_last_name: string
  father_dob: string
  father_country_of_birth: string
  father_location: string
  father_relationship_status: string
  father_abuse_neglect: boolean
  father_abuse_details: string
  mother_first_name: string
  mother_last_name: string
  mother_dob: string
  mother_country_of_birth: string
  mother_location: string
  mother_relationship_status: string
  mother_abuse_neglect: boolean
  mother_abuse_details: string
  parents_marital_status: string
  reunification_viable: boolean
  reunification_explanation: string

  // 3. Historia de abuso
  abuse_types: string[]
  abuse_narrative: string
  abuse_start_date: string
  abuse_ongoing: string
  abuse_reported: boolean
  abuse_report_details: string
  therapy_received: boolean
  therapy_details: string
  state_court_involved: boolean
  state_court_details: string
  state_court_state: string
  best_interest_in_us: string
}

const initialData: FormData = {
  minor_first_name: '',
  minor_last_name: '',
  minor_middle_name: '',
  minor_dob: '',
  minor_age: '',
  minor_gender: '',
  minor_country_of_birth: '',
  minor_nationality: '',
  minor_native_language: '',
  minor_speaks_english: false,
  minor_current_address: '',
  minor_city: '',
  minor_state: '',
  minor_zip: '',
  minor_phone: '',
  minor_email: '',
  minor_entry_date: '',
  minor_entry_manner: '',
  minor_a_number: '',
  minor_in_removal: false,
  minor_current_guardian: '',
  minor_guardian_relationship: '',
  minor_school_enrolled: false,
  minor_school_name: '',
  minor_grade: '',

  father_first_name: '',
  father_last_name: '',
  father_dob: '',
  father_country_of_birth: '',
  father_location: '',
  father_relationship_status: '',
  father_abuse_neglect: false,
  father_abuse_details: '',
  mother_first_name: '',
  mother_last_name: '',
  mother_dob: '',
  mother_country_of_birth: '',
  mother_location: '',
  mother_relationship_status: '',
  mother_abuse_neglect: false,
  mother_abuse_details: '',
  parents_marital_status: '',
  reunification_viable: false,
  reunification_explanation: '',

  abuse_types: [],
  abuse_narrative: '',
  abuse_start_date: '',
  abuse_ongoing: '',
  abuse_reported: false,
  abuse_report_details: '',
  therapy_received: false,
  therapy_details: '',
  state_court_involved: false,
  state_court_details: '',
  state_court_state: '',
  best_interest_in_us: '',
}

const sections = [
  { id: 1, title: 'Informacion del Menor', icon: '1' },
  { id: 2, title: 'Informacion de los Padres', icon: '2' },
  { id: 3, title: 'Historia de Abuso / Negligencia', icon: '3' },
]

const ABUSE_TYPE_OPTIONS = [
  'Abuso fisico',
  'Abuso emocional/psicologico',
  'Abuso sexual',
  'Abandono',
  'Negligencia',
]

export default function VisaJuvenilFormPage() {
  const [form, setForm] = useState<FormData>(initialData)
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]))
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  function toggleAbuseType(type: string) {
    setForm(prev => {
      const current = prev.abuse_types
      const next = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type]
      return { ...prev, abuse_types: next }
    })
    if (errors.abuse_types) {
      setErrors(prev => {
        const next = { ...prev }
        delete next.abuse_types
        return next
      })
    }
  }

  function toggleSection(id: number) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    // Section 1: Info del menor
    if (!form.minor_first_name.trim()) newErrors.minor_first_name = 'Nombre requerido'
    if (!form.minor_last_name.trim()) newErrors.minor_last_name = 'Apellido requerido'
    if (!form.minor_dob) newErrors.minor_dob = 'Fecha de nacimiento requerida'
    if (!form.minor_age.trim()) newErrors.minor_age = 'Edad requerida'
    if (!form.minor_gender) newErrors.minor_gender = 'Sexo requerido'
    if (!form.minor_country_of_birth.trim()) newErrors.minor_country_of_birth = 'Pais de nacimiento requerido'
    if (!form.minor_nationality.trim()) newErrors.minor_nationality = 'Nacionalidad requerida'
    if (!form.minor_native_language.trim()) newErrors.minor_native_language = 'Idioma nativo requerido'
    if (!form.minor_current_address.trim()) newErrors.minor_current_address = 'Direccion requerida'
    if (!form.minor_city.trim()) newErrors.minor_city = 'Ciudad requerida'
    if (!form.minor_state.trim()) newErrors.minor_state = 'Estado requerido'
    if (!form.minor_zip.trim()) newErrors.minor_zip = 'Codigo postal requerido'
    if (!form.minor_entry_date) newErrors.minor_entry_date = 'Fecha de entrada requerida'
    if (!form.minor_entry_manner) newErrors.minor_entry_manner = 'Manera de entrada requerida'
    if (!form.minor_current_guardian.trim()) newErrors.minor_current_guardian = 'Guardian requerido'
    if (!form.minor_guardian_relationship) newErrors.minor_guardian_relationship = 'Relacion con guardian requerida'

    // Section 2: Info de los padres
    if (!form.reunification_explanation.trim() || form.reunification_explanation.trim().length < 20)
      newErrors.reunification_explanation = 'Explique por que no es viable la reunificacion (minimo 20 caracteres)'

    // Section 3: Historia de abuso
    if (form.abuse_types.length === 0) newErrors.abuse_types = 'Seleccione al menos un tipo de maltrato'
    if (form.abuse_narrative.trim().length < 20) newErrors.abuse_narrative = 'Describa el abuso con detalle (minimo 20 caracteres)'
    if (!form.abuse_start_date.trim()) newErrors.abuse_start_date = 'Indique cuando comenzo el maltrato'
    if (!form.abuse_ongoing) newErrors.abuse_ongoing = 'Indique si el maltrato continua'
    if (form.best_interest_in_us.trim().length < 20) newErrors.best_interest_in_us = 'Explique por que debe quedarse en EE.UU. (minimo 20 caracteres)'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const errorSections = new Set<number>()
      const s1Keys = ['minor_first_name', 'minor_last_name', 'minor_dob', 'minor_age', 'minor_gender', 'minor_country_of_birth', 'minor_nationality', 'minor_native_language', 'minor_current_address', 'minor_city', 'minor_state', 'minor_zip', 'minor_entry_date', 'minor_entry_manner', 'minor_current_guardian', 'minor_guardian_relationship']
      const s2Keys = ['reunification_explanation']
      const s3Keys = ['abuse_types', 'abuse_narrative', 'abuse_start_date', 'abuse_ongoing', 'best_interest_in_us']

      for (const key of Object.keys(newErrors)) {
        if (s1Keys.includes(key)) errorSections.add(1)
        if (s2Keys.includes(key)) errorSections.add(2)
        if (s3Keys.includes(key)) errorSections.add(3)
      }
      setOpenSections(prev => new Set([...prev, ...errorSections]))
      return false
    }

    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error('Por favor complete los campos requeridos')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        minor_age: parseInt(form.minor_age, 10),
        abuse_types: form.abuse_types.join(', '),
      }

      const res = await fetch('/api/visa-juvenil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Error al enviar el formulario')
        return
      }

      setSubmitted(true)
      toast.success('Formulario enviado exitosamente')
    } catch {
      toast.error('Error de conexion. Intente de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#002855] mb-2">Formulario Enviado</h2>
          <p className="text-gray-600 mb-6">
            Su formulario de Visa Juvenil (SIJS) ha sido recibido exitosamente.
            Un representante de UsaLatinoPrime lo contactara pronto para revisar el caso del menor.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-[#002855]">
            <p className="font-medium">¿Tiene preguntas?</p>
            <p className="mt-1">Contactenos al <span className="font-semibold">801-941-3479</span></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="bg-[#002855] text-white py-4 px-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F2A900] rounded-lg flex items-center justify-center font-bold text-[#002855] text-lg">
            U
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">UsaLatinoPrime</h1>
            <p className="text-xs text-blue-200">Formulario Visa Juvenil (SIJS)</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Video Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="aspect-video bg-gradient-to-br from-[#002855] to-[#003d7a] flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <p className="text-sm font-medium">Video de instrucciones</p>
            <p className="text-xs text-blue-200 mt-1">Proximamente</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#F2A900]/10 border border-[#F2A900]/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-[#002855] font-medium mb-1">Instrucciones:</p>
          <p className="text-sm text-gray-700">
            Complete las 3 secciones del formulario con la mayor cantidad de detalle posible.
            Esta informacion es confidencial y sera utilizada unicamente para evaluar el caso de Visa Juvenil (SIJS) del menor.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Section 1: Info del Menor */}
          <SectionAccordion
            section={sections[0]}
            isOpen={openSections.has(1)}
            onToggle={() => toggleSection(1)}
            hasErrors={['minor_first_name', 'minor_last_name', 'minor_dob', 'minor_age', 'minor_gender', 'minor_country_of_birth', 'minor_nationality', 'minor_native_language', 'minor_current_address', 'minor_city', 'minor_state', 'minor_zip', 'minor_entry_date', 'minor_entry_manner', 'minor_current_guardian', 'minor_guardian_relationship'].some(k => errors[k])}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre del menor" error={errors.minor_first_name} required>
                  <input type="text" value={form.minor_first_name} onChange={e => update('minor_first_name', e.target.value)} placeholder="Nombre" className={inputClass(errors.minor_first_name)} />
                </Field>
                <Field label="Apellido del menor" error={errors.minor_last_name} required>
                  <input type="text" value={form.minor_last_name} onChange={e => update('minor_last_name', e.target.value)} placeholder="Apellido" className={inputClass(errors.minor_last_name)} />
                </Field>
              </div>
              <Field label="Segundo nombre">
                <input type="text" value={form.minor_middle_name} onChange={e => update('minor_middle_name', e.target.value)} placeholder="Segundo nombre (opcional)" className={inputClass()} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Fecha de nacimiento" error={errors.minor_dob} required>
                  <input type="date" value={form.minor_dob} onChange={e => update('minor_dob', e.target.value)} className={inputClass(errors.minor_dob)} />
                </Field>
                <Field label="Edad actual" error={errors.minor_age} required>
                  <input type="number" min="0" max="20" value={form.minor_age} onChange={e => update('minor_age', e.target.value)} placeholder="Ej: 16" className={inputClass(errors.minor_age)} />
                </Field>
              </div>
              <Field label="Sexo" error={errors.minor_gender} required>
                <select value={form.minor_gender} onChange={e => update('minor_gender', e.target.value)} className={inputClass(errors.minor_gender)}>
                  <option value="">Seleccione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Pais de nacimiento" error={errors.minor_country_of_birth} required>
                  <input type="text" value={form.minor_country_of_birth} onChange={e => update('minor_country_of_birth', e.target.value)} placeholder="Ej: Guatemala, Honduras..." className={inputClass(errors.minor_country_of_birth)} />
                </Field>
                <Field label="Nacionalidad" error={errors.minor_nationality} required>
                  <input type="text" value={form.minor_nationality} onChange={e => update('minor_nationality', e.target.value)} placeholder="Ej: Guatemalteca" className={inputClass(errors.minor_nationality)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Idioma nativo" error={errors.minor_native_language} required>
                  <input type="text" value={form.minor_native_language} onChange={e => update('minor_native_language', e.target.value)} placeholder="Ej: Espanol" className={inputClass(errors.minor_native_language)} />
                </Field>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.minor_speaks_english} onChange={e => update('minor_speaks_english', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                    <span className="text-sm font-medium text-gray-700">¿Habla ingles?</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Direccion actual en EE.UU.</p>
                <Field label="Direccion" error={errors.minor_current_address} required>
                  <input type="text" value={form.minor_current_address} onChange={e => update('minor_current_address', e.target.value)} placeholder="Calle y numero" className={inputClass(errors.minor_current_address)} />
                </Field>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  <Field label="Ciudad" error={errors.minor_city} required>
                    <input type="text" value={form.minor_city} onChange={e => update('minor_city', e.target.value)} className={inputClass(errors.minor_city)} />
                  </Field>
                  <Field label="Estado" error={errors.minor_state} required>
                    <input type="text" value={form.minor_state} onChange={e => update('minor_state', e.target.value)} placeholder="Ej: UT" className={inputClass(errors.minor_state)} />
                  </Field>
                  <Field label="Codigo postal" error={errors.minor_zip} required>
                    <input type="text" value={form.minor_zip} onChange={e => update('minor_zip', e.target.value)} placeholder="Ej: 84101" className={inputClass(errors.minor_zip)} />
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Telefono de contacto">
                  <input type="tel" value={form.minor_phone} onChange={e => update('minor_phone', e.target.value)} placeholder="(000) 000-0000" className={inputClass()} />
                </Field>
                <Field label="Correo electronico">
                  <input type="email" value={form.minor_email} onChange={e => update('minor_email', e.target.value)} placeholder="email@ejemplo.com" className={inputClass()} />
                </Field>
              </div>

              <div className="border-t pt-4 mt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Informacion migratoria</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Fecha de entrada a EE.UU." error={errors.minor_entry_date} required>
                    <input type="date" value={form.minor_entry_date} onChange={e => update('minor_entry_date', e.target.value)} className={inputClass(errors.minor_entry_date)} />
                  </Field>
                  <Field label="Manera de entrada" error={errors.minor_entry_manner} required>
                    <select value={form.minor_entry_manner} onChange={e => update('minor_entry_manner', e.target.value)} className={inputClass(errors.minor_entry_manner)}>
                      <option value="">Seleccione...</option>
                      <option value="Con visa">Con visa</option>
                      <option value="Sin inspeccion">Sin inspeccion</option>
                      <option value="Parole">Parole</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Numero A (si tiene)">
                    <input type="text" value={form.minor_a_number} onChange={e => update('minor_a_number', e.target.value)} placeholder="A-000000000" className={inputClass()} />
                  </Field>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.minor_in_removal} onChange={e => update('minor_in_removal', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                    <span className="text-sm font-medium text-gray-700">¿El menor esta en proceso de deportacion?</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Custodia actual</p>
                <Field label="¿Quien tiene la custodia actual del menor?" error={errors.minor_current_guardian} required>
                  <input type="text" value={form.minor_current_guardian} onChange={e => update('minor_current_guardian', e.target.value)} placeholder="Nombre del guardian, familiar, o agencia" className={inputClass(errors.minor_current_guardian)} />
                </Field>
                <div className="mt-4">
                  <Field label="Relacion con el guardian" error={errors.minor_guardian_relationship} required>
                    <select value={form.minor_guardian_relationship} onChange={e => update('minor_guardian_relationship', e.target.value)} className={inputClass(errors.minor_guardian_relationship)}>
                      <option value="">Seleccione...</option>
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Abuelo/a">Abuelo/a</option>
                      <option value="Tio/a">Tio/a</option>
                      <option value="Otro familiar">Otro familiar</option>
                      <option value="Familia adoptiva">Familia adoptiva</option>
                      <option value="Agencia estatal">Agencia estatal</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.minor_school_enrolled} onChange={e => update('minor_school_enrolled', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                  <span className="text-sm font-medium text-gray-700">¿Esta inscrito en la escuela?</span>
                </label>
                {form.minor_school_enrolled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <Field label="Nombre de la escuela">
                      <input type="text" value={form.minor_school_name} onChange={e => update('minor_school_name', e.target.value)} className={inputClass()} />
                    </Field>
                    <Field label="Grado escolar">
                      <input type="text" value={form.minor_grade} onChange={e => update('minor_grade', e.target.value)} placeholder="Ej: 10mo grado" className={inputClass()} />
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </SectionAccordion>

          {/* Section 2: Info de los Padres */}
          <SectionAccordion
            section={sections[1]}
            isOpen={openSections.has(2)}
            onToggle={() => toggleSection(2)}
            hasErrors={!!errors.reunification_explanation}
          >
            <div className="space-y-4">
              {/* Padre */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-[#002855] mb-3">Informacion del Padre</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nombre del padre">
                      <input type="text" value={form.father_first_name} onChange={e => update('father_first_name', e.target.value)} className={inputClass()} />
                    </Field>
                    <Field label="Apellido del padre">
                      <input type="text" value={form.father_last_name} onChange={e => update('father_last_name', e.target.value)} className={inputClass()} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Fecha de nacimiento">
                      <input type="text" value={form.father_dob} onChange={e => update('father_dob', e.target.value)} placeholder="Fecha aproximada" className={inputClass()} />
                    </Field>
                    <Field label="Pais de nacimiento">
                      <input type="text" value={form.father_country_of_birth} onChange={e => update('father_country_of_birth', e.target.value)} className={inputClass()} />
                    </Field>
                  </div>
                  <Field label="¿Donde se encuentra actualmente?">
                    <input type="text" value={form.father_location} onChange={e => update('father_location', e.target.value)} placeholder="Ciudad, pais" className={inputClass()} />
                  </Field>
                  <Field label="Relacion actual con el padre">
                    <select value={form.father_relationship_status} onChange={e => update('father_relationship_status', e.target.value)} className={inputClass()}>
                      <option value="">Seleccione...</option>
                      <option value="Sin contacto">Sin contacto</option>
                      <option value="Contacto limitado">Contacto limitado</option>
                      <option value="Contacto regular">Contacto regular</option>
                      <option value="Fallecido">Fallecido</option>
                      <option value="Desconocido">Desconocido</option>
                    </select>
                  </Field>
                  <div className="bg-white rounded-lg p-3 border space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.father_abuse_neglect} onChange={e => update('father_abuse_neglect', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                      <span className="text-sm font-medium text-gray-700">¿El padre abuso, abandono o descuido al menor?</span>
                    </label>
                    {form.father_abuse_neglect && (
                      <textarea value={form.father_abuse_details} onChange={e => update('father_abuse_details', e.target.value)} placeholder="Describa el abuso o negligencia del padre..." rows={3} className={inputClass()} />
                    )}
                  </div>
                </div>
              </div>

              {/* Madre */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-[#002855] mb-3">Informacion de la Madre</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nombre de la madre">
                      <input type="text" value={form.mother_first_name} onChange={e => update('mother_first_name', e.target.value)} className={inputClass()} />
                    </Field>
                    <Field label="Apellido de la madre">
                      <input type="text" value={form.mother_last_name} onChange={e => update('mother_last_name', e.target.value)} className={inputClass()} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Fecha de nacimiento">
                      <input type="text" value={form.mother_dob} onChange={e => update('mother_dob', e.target.value)} placeholder="Fecha aproximada" className={inputClass()} />
                    </Field>
                    <Field label="Pais de nacimiento">
                      <input type="text" value={form.mother_country_of_birth} onChange={e => update('mother_country_of_birth', e.target.value)} className={inputClass()} />
                    </Field>
                  </div>
                  <Field label="¿Donde se encuentra actualmente?">
                    <input type="text" value={form.mother_location} onChange={e => update('mother_location', e.target.value)} placeholder="Ciudad, pais" className={inputClass()} />
                  </Field>
                  <Field label="Relacion actual con la madre">
                    <select value={form.mother_relationship_status} onChange={e => update('mother_relationship_status', e.target.value)} className={inputClass()}>
                      <option value="">Seleccione...</option>
                      <option value="Sin contacto">Sin contacto</option>
                      <option value="Contacto limitado">Contacto limitado</option>
                      <option value="Contacto regular">Contacto regular</option>
                      <option value="Fallecida">Fallecida</option>
                      <option value="Desconocida">Desconocida</option>
                    </select>
                  </Field>
                  <div className="bg-white rounded-lg p-3 border space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.mother_abuse_neglect} onChange={e => update('mother_abuse_neglect', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                      <span className="text-sm font-medium text-gray-700">¿La madre abuso, abandono o descuido al menor?</span>
                    </label>
                    {form.mother_abuse_neglect && (
                      <textarea value={form.mother_abuse_details} onChange={e => update('mother_abuse_details', e.target.value)} placeholder="Describa el abuso o negligencia de la madre..." rows={3} className={inputClass()} />
                    )}
                  </div>
                </div>
              </div>

              {/* Estado civil y reunificacion */}
              <Field label="Estado civil de los padres">
                <select value={form.parents_marital_status} onChange={e => update('parents_marital_status', e.target.value)} className={inputClass()}>
                  <option value="">Seleccione...</option>
                  <option value="Casados">Casados</option>
                  <option value="Divorciados">Divorciados</option>
                  <option value="Separados">Separados</option>
                  <option value="Nunca casados">Nunca casados</option>
                  <option value="Viudo/a">Viudo/a</option>
                  <option value="Desconocido">Desconocido</option>
                </select>
              </Field>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.reunification_viable} onChange={e => update('reunification_viable', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                  <span className="text-sm font-medium text-gray-700">¿Es viable la reunificacion con uno o ambos padres?</span>
                </label>
                <p className="text-xs text-amber-700">Para SIJS, la reunificacion con al menos uno de los padres no debe ser viable.</p>
              </div>

              <Field label="Explique por que no es viable la reunificacion" error={errors.reunification_explanation} required>
                <textarea value={form.reunification_explanation} onChange={e => update('reunification_explanation', e.target.value)} placeholder="Describa las razones por las que la reunificacion con los padres no es viable o segura..." rows={4} className={inputClass(errors.reunification_explanation)} />
              </Field>
            </div>
          </SectionAccordion>

          {/* Section 3: Historia de Abuso */}
          <SectionAccordion
            section={sections[2]}
            isOpen={openSections.has(3)}
            onToggle={() => toggleSection(3)}
            hasErrors={['abuse_types', 'abuse_narrative', 'abuse_start_date', 'abuse_ongoing', 'best_interest_in_us'].some(k => errors[k])}
          >
            <div className="space-y-4">
              {/* Multi-select abuse types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipos de maltrato sufrido <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {ABUSE_TYPE_OPTIONS.map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.abuse_types.includes(type)}
                        onChange={() => toggleAbuseType(type)}
                        className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
                {errors.abuse_types && <p className="text-xs text-red-600 mt-1">{errors.abuse_types}</p>}
              </div>

              <Field label="Describa detalladamente el abuso, abandono o negligencia" error={errors.abuse_narrative} required>
                <textarea value={form.abuse_narrative} onChange={e => update('abuse_narrative', e.target.value)} placeholder="Incluya quien, que, cuando, donde. Sea lo mas especifico posible..." rows={6} className={inputClass(errors.abuse_narrative)} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="¿Cuando comenzo el maltrato?" error={errors.abuse_start_date} required>
                  <input type="text" value={form.abuse_start_date} onChange={e => update('abuse_start_date', e.target.value)} placeholder="Fecha o edad aproximada" className={inputClass(errors.abuse_start_date)} />
                </Field>
                <Field label="¿El maltrato continua?" error={errors.abuse_ongoing} required>
                  <select value={form.abuse_ongoing} onChange={e => update('abuse_ongoing', e.target.value)} className={inputClass(errors.abuse_ongoing)}>
                    <option value="">Seleccione...</option>
                    <option value="Continua">Continua</option>
                    <option value="Ha cesado">Ha cesado</option>
                    <option value="Ceso al salir del pais">Ceso al salir del pais</option>
                  </select>
                </Field>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.abuse_reported} onChange={e => update('abuse_reported', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                  <span className="text-sm font-medium text-gray-700">¿Se reporto el abuso a alguna autoridad?</span>
                </label>
                {form.abuse_reported && (
                  <textarea value={form.abuse_report_details} onChange={e => update('abuse_report_details', e.target.value)} placeholder="Describa a que autoridad y que paso..." rows={3} className={inputClass()} />
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.therapy_received} onChange={e => update('therapy_received', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                  <span className="text-sm font-medium text-gray-700">¿El menor ha recibido terapia o consejeria?</span>
                </label>
                {form.therapy_received && (
                  <textarea value={form.therapy_details} onChange={e => update('therapy_details', e.target.value)} placeholder="Describa la terapia recibida..." rows={3} className={inputClass()} />
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.state_court_involved} onChange={e => update('state_court_involved', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                  <span className="text-sm font-medium text-gray-700">¿Hay un caso en un tribunal estatal juvenil o de familia?</span>
                </label>
                <p className="text-xs text-gray-500">Se requiere una orden de un tribunal estatal para SIJS.</p>
                {form.state_court_involved && (
                  <div className="space-y-3">
                    <textarea value={form.state_court_details} onChange={e => update('state_court_details', e.target.value)} placeholder="Detalles del caso en tribunal..." rows={3} className={inputClass()} />
                    <Field label="Estado del tribunal">
                      <input type="text" value={form.state_court_state} onChange={e => update('state_court_state', e.target.value)} placeholder="Ej: Utah" className={inputClass()} />
                    </Field>
                  </div>
                )}
              </div>

              <Field label="¿Por que es mejor para el menor permanecer en EE.UU.?" error={errors.best_interest_in_us} required>
                <textarea value={form.best_interest_in_us} onChange={e => update('best_interest_in_us', e.target.value)} placeholder="Explique por que regresar al pais de origen no es en el mejor interes del menor..." rows={5} className={inputClass(errors.best_interest_in_us)} />
              </Field>
            </div>
          </SectionAccordion>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#002855] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#001d3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Formulario'
            )}
          </button>

          <p className="text-xs text-center text-gray-500 mt-4 pb-8">
            Su informacion es confidencial y esta protegida. Solo sera utilizada para evaluar el caso de Visa Juvenil (SIJS) del menor.
          </p>
        </form>
      </main>
    </div>
  )
}

// ── Helper Components ──

function inputClass(error?: string) {
  return `w-full px-4 py-3 rounded-lg border ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
  } text-sm focus:outline-none focus:ring-2 focus:ring-[#002855]/30 focus:border-[#002855] transition-colors`
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

function SectionAccordion({
  section,
  isOpen,
  onToggle,
  hasErrors,
  children,
}: {
  section: { id: number; title: string; icon: string }
  isOpen: boolean
  onToggle: () => void
  hasErrors?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border ${hasErrors ? 'border-red-300' : 'border-gray-200'} overflow-hidden`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            hasErrors
              ? 'bg-red-100 text-red-700'
              : 'bg-[#002855] text-white'
          }`}>
            {section.icon}
          </div>
          <span className="font-semibold text-[#002855]">{section.title}</span>
          {hasErrors && <span className="text-xs text-red-600 font-medium">Campos pendientes</span>}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  )
}
