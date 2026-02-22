'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Play, CheckCircle, Loader2 } from 'lucide-react'

interface FormData {
  full_name: string
  date_of_birth: string
  country_of_origin: string
  entry_date: string
  entry_method: string
  reason_for_leaving: string
  who_harmed: string
  what_happened: string
  when_happened: string
  where_happened: string
  had_witnesses: boolean
  witnesses_detail: string
  has_evidence: boolean
  evidence_detail: string
  went_to_police: boolean
  why_not_police: string
  police_response: string
  fear_if_return: string
  who_would_look: string
  still_receiving_threats: boolean
  threats_detail: string
}

const initialData: FormData = {
  full_name: '',
  date_of_birth: '',
  country_of_origin: '',
  entry_date: '',
  entry_method: '',
  reason_for_leaving: '',
  who_harmed: '',
  what_happened: '',
  when_happened: '',
  where_happened: '',
  had_witnesses: false,
  witnesses_detail: '',
  has_evidence: false,
  evidence_detail: '',
  went_to_police: false,
  why_not_police: '',
  police_response: '',
  fear_if_return: '',
  who_would_look: '',
  still_receiving_threats: false,
  threats_detail: '',
}

const sections = [
  { id: 1, title: 'Informacion Personal', icon: '1' },
  { id: 2, title: 'Motivo de Salida', icon: '2' },
  { id: 3, title: 'Eventos de Persecucion', icon: '3' },
  { id: 4, title: 'Proteccion en su Pais', icon: '4' },
  { id: 5, title: 'Temor Actual', icon: '5' },
]

export default function MiedoCreiblePage() {
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

    if (!form.full_name.trim()) newErrors.full_name = 'Nombre requerido'
    if (!form.date_of_birth) newErrors.date_of_birth = 'Fecha de nacimiento requerida'
    if (!form.country_of_origin.trim()) newErrors.country_of_origin = 'Pais de origen requerido'
    if (!form.entry_date) newErrors.entry_date = 'Fecha de entrada requerida'
    if (!form.entry_method.trim()) newErrors.entry_method = 'Metodo de entrada requerido'
    if (form.reason_for_leaving.trim().length < 10) newErrors.reason_for_leaving = 'Describa su motivo (minimo 10 caracteres)'
    if (!form.who_harmed.trim()) newErrors.who_harmed = 'Indique quien le hizo dano'
    if (form.what_happened.trim().length < 10) newErrors.what_happened = 'Describa que paso (minimo 10 caracteres)'
    if (!form.when_happened.trim()) newErrors.when_happened = 'Indique cuando paso'
    if (!form.where_happened.trim()) newErrors.where_happened = 'Indique donde paso'
    if (form.fear_if_return.trim().length < 10) newErrors.fear_if_return = 'Describa su temor (minimo 10 caracteres)'
    if (!form.who_would_look.trim()) newErrors.who_would_look = 'Indique quien lo buscaria'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      // Open sections with errors
      const errorSections = new Set<number>()
      const s1 = ['full_name', 'date_of_birth', 'country_of_origin', 'entry_date', 'entry_method']
      const s2 = ['reason_for_leaving']
      const s3 = ['who_harmed', 'what_happened', 'when_happened', 'where_happened']
      const s5 = ['fear_if_return', 'who_would_look']

      for (const key of Object.keys(newErrors)) {
        if (s1.includes(key)) errorSections.add(1)
        if (s2.includes(key)) errorSections.add(2)
        if (s3.includes(key)) errorSections.add(3)
        if (s5.includes(key)) errorSections.add(5)
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
      const res = await fetch('/api/credible-fear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
            Su formulario de miedo creible ha sido recibido exitosamente.
            Un representante de UsaLatinoPrime lo contactara pronto para revisar su caso.
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
            <p className="text-xs text-blue-200">Formulario de Miedo Creible</p>
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
            Complete las 5 secciones del formulario con la mayor cantidad de detalle posible.
            Esta informacion es confidencial y sera utilizada unicamente para evaluar su caso de asilo.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Section 1: Info Personal */}
          <SectionAccordion
            section={sections[0]}
            isOpen={openSections.has(1)}
            onToggle={() => toggleSection(1)}
            hasErrors={['full_name', 'date_of_birth', 'country_of_origin', 'entry_date', 'entry_method'].some(k => errors[k])}
          >
            <div className="space-y-4">
              <Field label="Nombre completo" error={errors.full_name} required>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => update('full_name', e.target.value)}
                  placeholder="Nombre y apellido"
                  className={inputClass(errors.full_name)}
                />
              </Field>
              <Field label="Fecha de nacimiento" error={errors.date_of_birth} required>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={e => update('date_of_birth', e.target.value)}
                  className={inputClass(errors.date_of_birth)}
                />
              </Field>
              <Field label="Pais de origen" error={errors.country_of_origin} required>
                <input
                  type="text"
                  value={form.country_of_origin}
                  onChange={e => update('country_of_origin', e.target.value)}
                  placeholder="Ej: Guatemala, Honduras, Venezuela..."
                  className={inputClass(errors.country_of_origin)}
                />
              </Field>
              <Field label="Fecha de entrada a Estados Unidos" error={errors.entry_date} required>
                <input
                  type="date"
                  value={form.entry_date}
                  onChange={e => update('entry_date', e.target.value)}
                  className={inputClass(errors.entry_date)}
                />
              </Field>
              <Field label="¿Como entro a Estados Unidos?" error={errors.entry_method} required>
                <input
                  type="text"
                  value={form.entry_method}
                  onChange={e => update('entry_method', e.target.value)}
                  placeholder="Ej: Por la frontera, con visa de turista..."
                  className={inputClass(errors.entry_method)}
                />
              </Field>
            </div>
          </SectionAccordion>

          {/* Section 2: Motivo de Salida */}
          <SectionAccordion
            section={sections[1]}
            isOpen={openSections.has(2)}
            onToggle={() => toggleSection(2)}
            hasErrors={!!errors.reason_for_leaving}
          >
            <Field label="¿Por que salio de su pais?" error={errors.reason_for_leaving} required>
              <textarea
                value={form.reason_for_leaving}
                onChange={e => update('reason_for_leaving', e.target.value)}
                placeholder="Describa con detalle las razones por las que tuvo que salir de su pais..."
                rows={5}
                className={inputClass(errors.reason_for_leaving)}
              />
            </Field>
          </SectionAccordion>

          {/* Section 3: Eventos de Persecucion */}
          <SectionAccordion
            section={sections[2]}
            isOpen={openSections.has(3)}
            onToggle={() => toggleSection(3)}
            hasErrors={['who_harmed', 'what_happened', 'when_happened', 'where_happened'].some(k => errors[k])}
          >
            <div className="space-y-4">
              <Field label="¿Quien le hizo dano o lo amenazo?" error={errors.who_harmed} required>
                <input
                  type="text"
                  value={form.who_harmed}
                  onChange={e => update('who_harmed', e.target.value)}
                  placeholder="Ej: Pandillas, gobierno, familiar..."
                  className={inputClass(errors.who_harmed)}
                />
              </Field>
              <Field label="¿Que paso exactamente?" error={errors.what_happened} required>
                <textarea
                  value={form.what_happened}
                  onChange={e => update('what_happened', e.target.value)}
                  placeholder="Describa los eventos de persecucion o violencia que sufrio..."
                  rows={5}
                  className={inputClass(errors.what_happened)}
                />
              </Field>
              <Field label="¿Cuando paso?" error={errors.when_happened} required>
                <input
                  type="text"
                  value={form.when_happened}
                  onChange={e => update('when_happened', e.target.value)}
                  placeholder="Ej: En marzo 2024, durante los ultimos 2 anos..."
                  className={inputClass(errors.when_happened)}
                />
              </Field>
              <Field label="¿Donde paso?" error={errors.where_happened} required>
                <input
                  type="text"
                  value={form.where_happened}
                  onChange={e => update('where_happened', e.target.value)}
                  placeholder="Ej: En mi ciudad, en mi casa, en el trabajo..."
                  className={inputClass(errors.where_happened)}
                />
              </Field>

              {/* Testigos */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.had_witnesses}
                    onChange={e => update('had_witnesses', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]"
                  />
                  <span className="text-sm font-medium text-gray-700">¿Hubo testigos?</span>
                </label>
                {form.had_witnesses && (
                  <textarea
                    value={form.witnesses_detail}
                    onChange={e => update('witnesses_detail', e.target.value)}
                    placeholder="Describa quienes fueron testigos..."
                    rows={2}
                    className={inputClass()}
                  />
                )}
              </div>

              {/* Evidencia */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.has_evidence}
                    onChange={e => update('has_evidence', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]"
                  />
                  <span className="text-sm font-medium text-gray-700">¿Tiene pruebas o evidencia?</span>
                </label>
                {form.has_evidence && (
                  <textarea
                    value={form.evidence_detail}
                    onChange={e => update('evidence_detail', e.target.value)}
                    placeholder="Describa que evidencia tiene (fotos, denuncias, reportes medicos...)"
                    rows={2}
                    className={inputClass()}
                  />
                )}
              </div>
            </div>
          </SectionAccordion>

          {/* Section 4: Proteccion en su Pais */}
          <SectionAccordion
            section={sections[3]}
            isOpen={openSections.has(4)}
            onToggle={() => toggleSection(4)}
          >
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.went_to_police}
                    onChange={e => update('went_to_police', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]"
                  />
                  <span className="text-sm font-medium text-gray-700">¿Acudio a la policia u otras autoridades?</span>
                </label>
              </div>

              {!form.went_to_police && (
                <Field label="¿Por que no acudio a la policia?">
                  <textarea
                    value={form.why_not_police}
                    onChange={e => update('why_not_police', e.target.value)}
                    placeholder="Explique por que no busco ayuda de las autoridades..."
                    rows={3}
                    className={inputClass()}
                  />
                </Field>
              )}

              {form.went_to_police && (
                <Field label="¿Que hicieron las autoridades?">
                  <textarea
                    value={form.police_response}
                    onChange={e => update('police_response', e.target.value)}
                    placeholder="Describa la respuesta de las autoridades..."
                    rows={3}
                    className={inputClass()}
                  />
                </Field>
              )}
            </div>
          </SectionAccordion>

          {/* Section 5: Temor Actual */}
          <SectionAccordion
            section={sections[4]}
            isOpen={openSections.has(5)}
            onToggle={() => toggleSection(5)}
            hasErrors={['fear_if_return', 'who_would_look'].some(k => errors[k])}
          >
            <div className="space-y-4">
              <Field label="¿Que le pasaria si regresa a su pais?" error={errors.fear_if_return} required>
                <textarea
                  value={form.fear_if_return}
                  onChange={e => update('fear_if_return', e.target.value)}
                  placeholder="Describa que teme que le pase si regresa..."
                  rows={4}
                  className={inputClass(errors.fear_if_return)}
                />
              </Field>
              <Field label="¿Quien lo buscaria o perseguiria?" error={errors.who_would_look} required>
                <input
                  type="text"
                  value={form.who_would_look}
                  onChange={e => update('who_would_look', e.target.value)}
                  placeholder="Ej: Los mismos pandilleros, el gobierno, un familiar..."
                  className={inputClass(errors.who_would_look)}
                />
              </Field>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.still_receiving_threats}
                    onChange={e => update('still_receiving_threats', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]"
                  />
                  <span className="text-sm font-medium text-gray-700">¿Sigue recibiendo amenazas actualmente?</span>
                </label>
                {form.still_receiving_threats && (
                  <textarea
                    value={form.threats_detail}
                    onChange={e => update('threats_detail', e.target.value)}
                    placeholder="Describa las amenazas que sigue recibiendo..."
                    rows={2}
                    className={inputClass()}
                  />
                )}
              </div>
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
            Su informacion es confidencial y esta protegida. Solo sera utilizada para evaluar su caso de asilo.
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
