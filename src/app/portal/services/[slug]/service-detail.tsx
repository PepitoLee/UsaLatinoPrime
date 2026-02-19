'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  AlertCircle, CheckCircle, ArrowRight, Download,
  MessageCircle, FileText, Shield, Sparkles, Clock,
  CreditCard, PenLine, Loader2, Lock, PartyPopper,
  Plus, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { getWorkflow } from '@/lib/workflows'
import { getContractTemplate } from '@/lib/contracts'
import { getServiceInfo } from '@/lib/service-info'
import { ServiceInfoBanner } from '@/components/portal/ServiceInfoBanner'
import type { ServiceCatalog } from '@/types/database'

interface ServiceDetailProps {
  service: ServiceCatalog
  userId: string
  existingCase?: { id: string; access_granted: boolean; intake_status: string } | null
  userName?: string
}

type FlowStep = 'eligibility' | 'contract_form' | 'contract_ready'

export function ServiceDetail({ service, userId, existingCase, userName }: ServiceDetailProps) {
  const [eligibilityAnswers, setEligibilityAnswers] = useState<Record<string, any>>({})
  const [eligibilityPassed, setEligibilityPassed] = useState<boolean | null>(null)
  const [failMessages, setFailMessages] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [flowStep, setFlowStep] = useState<FlowStep>(existingCase ? 'contract_ready' : 'eligibility')
  const [contractForm, setContractForm] = useState({
    clientFullName: '',
    clientPassport: '',
    clientDOB: '',
    clientSignature: '',
  })
  const [minors, setMinors] = useState<{ fullName: string; dob: string; birthplace: string; passport: string }[]>([
    { fullName: '', dob: '', birthplace: '', passport: '' },
  ])
  const [contractGenerated, setContractGenerated] = useState(!!existingCase)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [creditPhase, setCreditPhase] = useState<'idle' | 'checking' | 'approved'>('idle')
  const [showConfetti, setShowConfetti] = useState(false)

  function addMinor() {
    setMinors([...minors, { fullName: '', dob: '', birthplace: '', passport: '' }])
  }

  function removeMinor(index: number) {
    if (minors.length <= 1) return
    setMinors(minors.filter((_, i) => i !== index))
  }

  function updateMinor(index: number, field: 'fullName' | 'dob' | 'birthplace' | 'passport', value: string) {
    setMinors(minors.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function handleCreditApproval() {
    setCreditPhase('checking')
    setTimeout(() => {
      setCreditPhase('approved')
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3500)
    }, 1800)
  }

  const router = useRouter()
  const supabase = createClient()

  const questions = service.eligibility_questions as any[] | null
  const hasEligibility = questions && questions.length > 0
  const workflow = getWorkflow(service.slug)
  const contractTemplate = getContractTemplate(service.slug)
  const serviceInfo = getServiceInfo(service.slug)

  function checkEligibility() {
    if (!questions || questions.length === 0) {
      setEligibilityPassed(true)
      return
    }

    const fails: string[] = []
    for (const q of questions) {
      const answer = eligibilityAnswers[q.id]
      if (q.type === 'boolean' && q.required_answer !== undefined) {
        if (answer !== q.required_answer) fails.push(q.fail_message)
      }
      if (q.type === 'multi_select' && q.min_selections) {
        if (!Array.isArray(answer) || answer.length < q.min_selections) fails.push(q.fail_message)
      }
    }

    setFailMessages(fails)
    setEligibilityPassed(fails.length === 0)
    if (fails.length === 0) {
      setFlowStep('contract_form')
    }
  }

  function handleGenerateContract() {
    if (!contractTemplate) return
    if (!contractForm.clientFullName.trim() || !contractForm.clientPassport.trim() || !contractForm.clientDOB) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    if (contractTemplate.requiresMinor) {
      const invalidMinor = minors.some(m => !m.fullName.trim() || !m.dob)
      if (invalidMinor) {
        toast.error('Complete nombre y fecha de nacimiento de todos los menores')
        return
      }
    }
    if (!contractForm.clientSignature.trim()) {
      toast.error('Debe firmar el contrato escribiendo su nombre completo')
      return
    }

    setContractGenerated(true)
    setFlowStep('contract_ready')
    toast.success('Contrato generado exitosamente')
  }

  async function handleDownloadPDF() {
    if (!contractTemplate) return
    try {
      const { generateContractPDF: genPDF } = await import('@/lib/pdf/generate-contract-pdf')
      const variant = contractTemplate.variants[selectedVariantIndex]
      const pdf = genPDF({
        serviceName: service.name,
        totalPrice: variant.totalPrice,
        installments: contractTemplate.installments,
        clientFullName: contractForm.clientFullName.trim(),
        clientPassport: contractForm.clientPassport.trim(),
        clientDOB: contractForm.clientDOB,
        ...(contractTemplate.requiresMinor && {
          minors: minors.map(m => ({
            fullName: m.fullName.trim(),
            dob: m.dob,
            birthplace: m.birthplace.trim(),
            passport: m.passport.trim(),
          })),
        }),
        clientSignature: contractForm.clientSignature.trim(),
        objetoDelContrato: contractTemplate.objetoDelContrato,
        etapas: contractTemplate.etapas,
      })
      const arrayBuffer = pdf.output('arraybuffer')
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Contrato-${service.slug}-${contractForm.clientFullName.replace(/\s+/g, '_')}.pdf`
      link.type = 'application/pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error: any) {
      console.error('PDF generation error:', error)
      toast.error(`Error al generar el PDF: ${error.message}`)
    }
  }

  async function handleWhatsAppPayment() {
    if (!contractTemplate) return
    setPaymentLoading(true)
    try {
      const variant = contractTemplate.variants[selectedVariantIndex]

      // Create case if it doesn't exist
      let targetCaseId = existingCase?.id
      if (!targetCaseId) {
        const { data: newCase, error } = await supabase
          .from('cases')
          .insert({
            case_number: '',
            client_id: userId,
            service_id: service.id,
            intake_status: 'in_progress',
            total_cost: variant.totalPrice,
            total_steps: workflow?.steps.length || 0,
            form_data: {},
            current_step: 0,
          })
          .select()
          .single()

        if (error) throw error
        targetCaseId = newCase.id

        await supabase.from('case_activity').insert({
          case_id: newCase.id,
          actor_id: userId,
          action: 'case_created',
          description: `Caso creado para ${service.name} - Pago por WhatsApp`,
        })
      }

      // Notificar a Henry que un cliente quiere pagar por WhatsApp
      await fetch('/api/notifications/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: targetCaseId,
          title: 'Nuevo Pago por WhatsApp',
          message: `${contractForm.clientFullName || userName} quiere pagar ${service.name} ($${variant.totalPrice.toLocaleString()}) por WhatsApp. Crear plan de pago.`,
          type: 'payment',
        }),
      })

      // Open WhatsApp
      window.open(getWhatsAppURL(), '_blank')
      toast.success('Se abrio WhatsApp. Henry le dara acceso una vez confirmado el pago.')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar. Intente de nuevo.')
    } finally {
      setPaymentLoading(false)
    }
  }

  function getWhatsAppURL() {
    if (!contractTemplate) return ''
    const variant = contractTemplate.variants[selectedVariantIndex]
    const name = contractForm.clientFullName.trim()
    const total = variant.totalPrice.toLocaleString()
    let pagoInfo: string
    if (contractTemplate.installments) {
      const cuota = Math.round(variant.totalPrice / 10).toLocaleString()
      pagoInfo = `Total $${total} en 10 cuotas de $${cuota}/mes`
    } else {
      pagoInfo = `Total $${total} (pago unico)`
    }
    const text = encodeURIComponent(
      `Hola, soy ${name}. Ya tengo mi contrato de ${service.name}. ${pagoInfo}. Estoy listo/a para iniciar.`
    )
    return `https://wa.me/18019413479?text=${text}`
  }

  async function handleStartCase() {
    setCreating(true)
    try {
      const { data: newCase, error } = await supabase
        .from('cases')
        .insert({
          case_number: '',
          client_id: userId,
          service_id: service.id,
          intake_status: 'in_progress',
          total_cost: service.base_price,
          total_steps: workflow?.steps.length || 0,
          form_data: {},
          current_step: 0,
        })
        .select()
        .single()

      if (error) throw error

      await supabase.from('case_activity').insert({
        case_id: newCase.id,
        actor_id: userId,
        action: 'case_created',
        description: `Caso creado para ${service.name}`,
      })

      toast.success('Caso creado exitosamente')
      router.push(`/portal/cases/${newCase.id}/wizard`)
    } catch (error) {
      console.error('Error creating case:', error)
      toast.error('Error al crear el caso')
    } finally {
      setCreating(false)
    }
  }

  async function handleStripePayment(caseId?: string) {
    if (!contractTemplate) return
    setPaymentLoading(true)
    try {
      const variant = contractTemplate.variants[selectedVariantIndex]
      let targetCaseId = caseId

      // If no case exists yet, create one first
      if (!targetCaseId) {
        const { data: newCase, error } = await supabase
          .from('cases')
          .insert({
            case_number: '',
            client_id: userId,
            service_id: service.id,
            intake_status: 'in_progress',
            total_cost: variant.totalPrice,
            total_steps: workflow?.steps.length || 0,
            form_data: {},
            current_step: 0,
          })
          .select()
          .single()

        if (error) throw error
        targetCaseId = newCase.id

        await supabase.from('case_activity').insert({
          case_id: newCase.id,
          actor_id: userId,
          action: 'case_created',
          description: `Caso creado para ${service.name}`,
        })
      }

      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: targetCaseId,
          service_name: service.name,
          variant_label: variant.label,
          total_price: variant.totalPrice,
          installments: contractTemplate.installments,
          installment_number: 1,
          total_installments: contractTemplate.installments ? 10 : 1,
          service_slug: service.slug,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear sesion de pago')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se recibio URL de pago')
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error)
      toast.error(error.message || 'Error al procesar el pago')
    } finally {
      setPaymentLoading(false)
    }
  }

  const selectedVariant = contractTemplate?.variants[selectedVariantIndex]

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">

      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#002855] via-[#003570] to-[#001a3a] p-8 shadow-2xl shadow-[#002855]/20">
        {/* Decorative gold corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="absolute top-4 right-4 w-20 h-[1px] bg-[#F2A900]" />
          <div className="absolute top-4 right-4 w-[1px] h-20 bg-[#F2A900]" />
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
          <div className="absolute bottom-4 left-4 w-20 h-[1px] bg-[#F2A900]" />
          <div className="absolute bottom-4 left-4 w-[1px] h-20 bg-[#F2A900]" />
        </div>
        {/* Subtle radial glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#F2A900]/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-[2px] w-8 bg-[#F2A900]" />
            <span className="text-[#F2A900] text-xs font-semibold tracking-[0.2em] uppercase">
              UsaLatinoPrime
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
            {service.name}
          </h1>
          <p className="text-blue-200/70 mt-2 text-sm leading-relaxed max-w-lg">
            {service.short_description}
          </p>

          {/* Metadata pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {service.estimated_duration && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-blue-100 border border-white/10">
                <Clock className="w-3 h-3" />
                {service.estimated_duration}
              </span>
            )}
            {service.uscis_forms && service.uscis_forms.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-blue-100 border border-white/10">
                <FileText className="w-3 h-3" />
                {service.uscis_forms.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SERVICE INFO BANNER ═══ */}
      {serviceInfo && contractTemplate && (
        <ServiceInfoBanner
          serviceInfo={serviceInfo}
          serviceName={service.name}
          henryFee={contractTemplate.variants[selectedVariantIndex].totalPrice}
          installments={contractTemplate.installments}
        />
      )}

      {/* ═══ PRICING CARD ═══ */}
      <div className="relative rounded-2xl border border-[#F2A900]/20 bg-gradient-to-b from-[#FFFDF5] to-white p-6 shadow-lg shadow-[#F2A900]/5">
        {/* Gold top accent bar */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#F2A900] to-transparent" />

        {contractTemplate && contractTemplate.variants.length > 1 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#F2A900]" />
              <p className="text-sm font-medium text-[#002855]">Seleccione el tipo de servicio</p>
            </div>
            <RadioGroup
              value={selectedVariantIndex.toString()}
              onValueChange={(v) => setSelectedVariantIndex(Number(v))}
            >
              {contractTemplate.variants.map((variant, i) => (
                <label
                  key={i}
                  htmlFor={`variant-${i}`}
                  className={`
                    flex items-center justify-between rounded-xl p-4 cursor-pointer
                    transition-all duration-200 border-2
                    ${selectedVariantIndex === i
                      ? 'border-[#F2A900] bg-[#F2A900]/5 shadow-md shadow-[#F2A900]/10'
                      : 'border-gray-200 hover:border-[#F2A900]/40 hover:bg-[#FFFDF5]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={i.toString()} id={`variant-${i}`} />
                    <span className="font-medium text-[#002855]">{variant.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-[#002855]">
                    ${variant.totalPrice.toLocaleString()}
                  </span>
                </label>
              ))}
            </RadioGroup>
            <div className="pt-2">
              {contractTemplate.installments ? (
                <div className="credit-check-container">
                  {creditPhase === 'idle' && (
                    <button
                      onClick={handleCreditApproval}
                      className="group relative w-full rounded-2xl border-2 border-dashed border-[#F2A900]/50 hover:border-[#F2A900] bg-[#FFFBF0] hover:bg-[#FFF8E1] transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="px-4 py-4 flex items-center gap-4">
                        <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#F2A900] to-[#E09800] flex items-center justify-center shadow-md shadow-[#F2A900]/20 group-hover:shadow-lg group-hover:shadow-[#F2A900]/30 transition-shadow">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[13px] font-bold text-[#002855] leading-tight">
                            Plan de cuotas disponible
                          </p>
                          <p className="text-xs text-[#002855]/50 mt-0.5">
                            Toque para verificar si califica — <span className="font-semibold text-[#F2A900]">10 pagos de ${Math.round(contractTemplate.variants[selectedVariantIndex].totalPrice / 10).toLocaleString()}/mes</span>
                          </p>
                        </div>
                        <div className="shrink-0 w-8 h-8 rounded-full bg-[#002855] flex items-center justify-center group-hover:bg-[#003570] transition-colors">
                          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>
                  )}
                  {creditPhase === 'checking' && (
                    <div className="w-full rounded-2xl border-2 border-[#002855]/20 bg-[#F8FBFF] px-4 py-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Loader2 className="w-5 h-5 text-[#002855] animate-spin shrink-0" />
                        <p className="text-sm font-semibold text-[#002855]">Verificando elegibilidad...</p>
                      </div>
                      <div className="h-2 rounded-full bg-[#002855]/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#002855] to-[#F2A900]" style={{ animation: 'credit-progress 1.6s ease-in-out forwards' }} />
                      </div>
                    </div>
                  )}
                  {creditPhase === 'approved' && (
                    <div className="w-full rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-4 animate-in zoom-in-95 fade-in duration-500">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center credit-check-pop">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-emerald-700">Aprobado</p>
                            <PartyPopper className="w-4 h-4 text-[#F2A900] credit-party-icon" />
                          </div>
                          <p className="text-xs text-emerald-600/80 mt-0.5 font-medium">
                            10 cuotas de <span className="font-bold">${Math.round(contractTemplate.variants[selectedVariantIndex].totalPrice / 10).toLocaleString()}/mes</span> — sin intereses
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
                  <p className="text-sm text-[#002855]/60">Pago unico</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-[#002855]/50 uppercase tracking-wider mb-1">
                Costo del servicio
              </p>
              <p className="text-4xl font-bold text-[#002855] tracking-tight">
                ${contractTemplate ? contractTemplate.variants[0].totalPrice.toLocaleString() : service.base_price.toLocaleString()}
              </p>
              <div className="mt-3">
                {contractTemplate?.installments ? (
                  <div className="credit-check-container">
                    {creditPhase === 'idle' && (
                      <button
                        onClick={handleCreditApproval}
                        className="group relative w-full rounded-2xl border-2 border-dashed border-[#F2A900]/50 hover:border-[#F2A900] bg-[#FFFBF0] hover:bg-[#FFF8E1] transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        <div className="px-4 py-4 flex items-center gap-4">
                          <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#F2A900] to-[#E09800] flex items-center justify-center shadow-md shadow-[#F2A900]/20 group-hover:shadow-lg group-hover:shadow-[#F2A900]/30 transition-shadow">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-[13px] font-bold text-[#002855] leading-tight">
                              Plan de cuotas disponible
                            </p>
                            <p className="text-xs text-[#002855]/50 mt-0.5">
                              Toque para verificar si califica — <span className="font-semibold text-[#F2A900]">10 pagos de ${Math.round(contractTemplate.variants[0].totalPrice / 10).toLocaleString()}/mes</span>
                            </p>
                          </div>
                          <div className="shrink-0 w-8 h-8 rounded-full bg-[#002855] flex items-center justify-center group-hover:bg-[#003570] transition-colors">
                            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </button>
                    )}
                    {creditPhase === 'checking' && (
                      <div className="w-full rounded-2xl border-2 border-[#002855]/20 bg-[#F8FBFF] px-4 py-4 animate-in fade-in duration-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Loader2 className="w-5 h-5 text-[#002855] animate-spin shrink-0" />
                          <p className="text-sm font-semibold text-[#002855]">Verificando elegibilidad...</p>
                        </div>
                        <div className="h-2 rounded-full bg-[#002855]/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#002855] to-[#F2A900]" style={{ animation: 'credit-progress 1.6s ease-in-out forwards' }} />
                        </div>
                      </div>
                    )}
                    {creditPhase === 'approved' && (
                      <div className="w-full rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-4 animate-in zoom-in-95 fade-in duration-500">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center credit-check-pop">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-emerald-700">Aprobado</p>
                              <PartyPopper className="w-4 h-4 text-[#F2A900] credit-party-icon" />
                            </div>
                            <p className="text-xs text-emerald-600/80 mt-0.5 font-medium">
                              10 cuotas de <span className="font-bold">${Math.round(contractTemplate.variants[0].totalPrice / 10).toLocaleString()}/mes</span> — sin intereses
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
                    <p className="text-sm text-[#002855]/60">Pago unico</p>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#002855]/5 border border-[#002855]/10">
                <Shield className="w-3.5 h-3.5 text-[#002855]/50" />
                <span className="text-xs font-medium text-[#002855]/60">Servicio garantizado</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ ELIGIBILITY QUESTIONS ═══ */}
      {hasEligibility && eligibilityPassed === null && flowStep === 'eligibility' && (
        <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-lg overflow-hidden">
          {/* Left accent stripe */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#F2A900] to-[#002855]" />

          <div className="pl-4">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#002855]/5">
                <Shield className="w-4 h-4 text-[#002855]" />
              </div>
              <h3 className="text-lg font-semibold text-[#002855]">Pre-calificacion</h3>
            </div>

            <div className="space-y-6">
              {questions.map((q: any, qi: number) => (
                <div key={q.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#002855] text-white text-xs font-bold mt-0.5">
                      {qi + 1}
                    </span>
                    <Label className="text-sm font-medium text-gray-800 leading-relaxed">{q.question}</Label>
                  </div>
                  {q.type === 'boolean' && (
                    <RadioGroup
                      value={eligibilityAnswers[q.id]?.toString()}
                      onValueChange={(v) =>
                        setEligibilityAnswers({ ...eligibilityAnswers, [q.id]: v === 'true' })
                      }
                      className="ml-9"
                    >
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor={`${q.id}-yes`}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                            eligibilityAnswers[q.id] === true
                              ? 'border-[#002855] bg-[#002855]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <RadioGroupItem value="true" id={`${q.id}-yes`} />
                          <Label htmlFor={`${q.id}-yes`} className="cursor-pointer">Si</Label>
                        </label>
                        <label
                          htmlFor={`${q.id}-no`}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                            eligibilityAnswers[q.id] === false
                              ? 'border-[#002855] bg-[#002855]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <RadioGroupItem value="false" id={`${q.id}-no`} />
                          <Label htmlFor={`${q.id}-no`} className="cursor-pointer">No</Label>
                        </label>
                      </div>
                    </RadioGroup>
                  )}
                  {q.type === 'multi_select' && (
                    <div className="space-y-2 ml-9">
                      {q.options?.map((opt: string) => (
                        <label
                          key={opt}
                          htmlFor={`${q.id}-${opt}`}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            (eligibilityAnswers[q.id] || []).includes(opt)
                              ? 'border-[#002855] bg-[#002855]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Checkbox
                            id={`${q.id}-${opt}`}
                            checked={(eligibilityAnswers[q.id] || []).includes(opt)}
                            onCheckedChange={(checked) => {
                              const current = eligibilityAnswers[q.id] || []
                              setEligibilityAnswers({
                                ...eligibilityAnswers,
                                [q.id]: checked
                                  ? [...current, opt]
                                  : current.filter((o: string) => o !== opt),
                              })
                            }}
                          />
                          <Label htmlFor={`${q.id}-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={checkEligibility}
              size="lg"
              className="w-full mt-8 bg-[#002855] hover:bg-[#003570] text-white h-12 text-base rounded-xl shadow-lg shadow-[#002855]/20 transition-all hover:shadow-xl hover:shadow-[#002855]/30 hover:-translate-y-0.5"
            >
              Verificar Elegibilidad
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══ ELIGIBILITY FAILED ═══ */}
      {eligibilityPassed === false && (
        <div className="relative rounded-2xl border border-red-200 bg-gradient-to-b from-red-50 to-white p-6 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-300" />
          <div className="pl-4 flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 text-lg">Posibles limitaciones</h3>
              <ul className="mt-3 space-y-2">
                {failMessages.map((msg, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    {msg}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-red-600/80 mt-4 pt-3 border-t border-red-100">
                Contacte a Henry para evaluar su caso especifico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NO ELIGIBILITY → CONTRACT BUTTON ═══ */}
      {!hasEligibility && flowStep === 'eligibility' && (
        <button
          onClick={() => setFlowStep('contract_form')}
          className="group relative w-full rounded-2xl bg-gradient-to-r from-[#002855] to-[#003570] p-6 text-left shadow-lg shadow-[#002855]/20 transition-all hover:shadow-xl hover:shadow-[#002855]/30 hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#F2A900]/0 via-[#F2A900]/5 to-[#F2A900]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <FileText className="w-6 h-6 text-[#F2A900]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Llenar mi Contrato</p>
                <p className="text-sm text-blue-200/60 mt-0.5">Complete sus datos para generar el contrato</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#F2A900] group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      )}

      {/* ═══ CONTRACT FORM ═══ */}
      {flowStep === 'contract_form' && (
        <div className="relative rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {/* Navy top bar with gold accent */}
          <div className="bg-gradient-to-r from-[#002855] to-[#003570] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <PenLine className="w-5 h-5 text-[#F2A900]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Datos para el Contrato</h3>
                <p className="text-sm text-blue-200/60">Ingrese su informacion personal</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Client fields */}
            <div className="space-y-1.5">
              <Label htmlFor="clientFullName" className="text-sm font-medium text-[#002855]">
                Nombre completo <span className="text-[#F2A900]">*</span>
              </Label>
              <Input
                id="clientFullName"
                placeholder="Nombre y apellidos como aparece en su pasaporte"
                value={contractForm.clientFullName}
                onChange={(e) => setContractForm({ ...contractForm, clientFullName: e.target.value })}
                className="h-11 rounded-xl border-gray-200 focus:border-[#002855] focus:ring-[#002855]/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientPassport" className="text-sm font-medium text-[#002855]">
                Numero de pasaporte <span className="text-[#F2A900]">*</span>
              </Label>
              <Input
                id="clientPassport"
                placeholder="Ej: A12345678"
                value={contractForm.clientPassport}
                onChange={(e) => setContractForm({ ...contractForm, clientPassport: e.target.value })}
                className="h-11 rounded-xl border-gray-200 focus:border-[#002855] focus:ring-[#002855]/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientDOB" className="text-sm font-medium text-[#002855]">
                Fecha de nacimiento <span className="text-[#F2A900]">*</span>
              </Label>
              <Input
                id="clientDOB"
                type="date"
                value={contractForm.clientDOB}
                onChange={(e) => setContractForm({ ...contractForm, clientDOB: e.target.value })}
                className="h-11 rounded-xl border-gray-200 focus:border-[#002855] focus:ring-[#002855]/20"
              />
            </div>

            {/* Minor fields */}
            {contractTemplate?.requiresMinor && (
              <>
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-xs font-semibold text-[#002855]/50 uppercase tracking-wider flex items-center gap-2">
                      Menores Beneficiarios
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#002855] text-white text-[10px] font-bold">
                        {minors.length}
                      </span>
                    </span>
                  </div>
                </div>

                {minors.map((minor, index) => (
                  <div key={index} className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#002855]">Hijo/a #{index + 1}</p>
                      {minors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMinor(index)}
                          className="flex items-center justify-center w-7 h-7 rounded-lg border border-red-200 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`minorFullName-${index}`} className="text-sm font-medium text-[#002855]">
                        Nombre completo del menor <span className="text-[#F2A900]">*</span>
                      </Label>
                      <Input
                        id={`minorFullName-${index}`}
                        placeholder="Nombre y apellidos del menor"
                        value={minor.fullName}
                        onChange={(e) => updateMinor(index, 'fullName', e.target.value)}
                        className="h-11 rounded-xl border-gray-200 focus:border-[#002855] focus:ring-[#002855]/20 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`minorDOB-${index}`} className="text-sm font-medium text-[#002855]">
                        Fecha de nacimiento del menor <span className="text-[#F2A900]">*</span>
                      </Label>
                      <Input
                        id={`minorDOB-${index}`}
                        type="date"
                        value={minor.dob}
                        onChange={(e) => updateMinor(index, 'dob', e.target.value)}
                        className="h-11 rounded-xl border-gray-200 focus:border-[#002855] focus:ring-[#002855]/20 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`minorBirthplace-${index}`} className="text-sm font-medium text-[#002855]">
                        Lugar de nacimiento del menor
                      </Label>
                      <Input
                        id={`minorBirthplace-${index}`}
                        placeholder="Ciudad, Pais"
                        value={minor.birthplace}
                        onChange={(e) => updateMinor(index, 'birthplace', e.target.value)}
                        className="h-11 rounded-xl border-gray-200 focus:border-[#002855] focus:ring-[#002855]/20 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`minorPassport-${index}`} className="text-sm font-medium text-[#002855]">
                        Pasaporte del menor
                      </Label>
                      <Input
                        id={`minorPassport-${index}`}
                        placeholder="Numero de pasaporte del menor"
                        value={minor.passport}
                        onChange={(e) => updateMinor(index, 'passport', e.target.value)}
                        className="h-11 rounded-xl border-gray-200 focus:border-[#002855] focus:ring-[#002855]/20 bg-white"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMinor}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#F2A900]/40 hover:border-[#F2A900] bg-[#FFFBF0] hover:bg-[#FFF8E1] px-4 py-3 text-sm font-medium text-[#002855]/70 hover:text-[#002855] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Agregar otro hijo/a
                </button>
              </>
            )}

            {/* Signature section */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs font-semibold text-[#002855]/50 uppercase tracking-wider">
                  Firma Digital
                </span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-[#002855]/15 bg-[#002855]/[0.02] p-5 space-y-3">
              <div className="flex items-start gap-2">
                <PenLine className="w-4 h-4 text-[#002855]/40 mt-0.5" />
                <p className="text-xs text-[#002855]/50 leading-relaxed">
                  Escriba su nombre completo tal como aparece en su pasaporte. Este sera utilizado como su firma digital en el contrato.
                </p>
              </div>
              <Input
                id="clientSignature"
                placeholder="Escriba su nombre completo como firma"
                value={contractForm.clientSignature}
                onChange={(e) => setContractForm({ ...contractForm, clientSignature: e.target.value })}
                className="h-14 rounded-xl border-gray-200 focus:border-[#002855] focus:ring-[#002855]/20 font-serif italic text-xl text-center bg-white"
              />
              {contractForm.clientSignature.trim() && (
                <p className="text-center text-xs text-[#002855]/40">
                  Asi aparecera su firma en el contrato
                </p>
              )}
            </div>

            <Button
              onClick={handleGenerateContract}
              size="lg"
              className="w-full bg-gradient-to-r from-[#002855] to-[#003570] hover:from-[#003570] hover:to-[#002855] text-white h-13 text-base rounded-xl shadow-lg shadow-[#002855]/20 transition-all hover:shadow-xl hover:shadow-[#002855]/30 hover:-translate-y-0.5 mt-2"
            >
              Generar mi Contrato
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══ CONTRACT READY ═══ */}
      {flowStep === 'contract_ready' && (
        <div className="space-y-5">
          {/* Success card */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            {/* Gradient background */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8">
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                <div className="absolute top-6 right-6 w-24 h-[1px] bg-white" />
                <div className="absolute top-6 right-6 w-[1px] h-24 bg-white" />
              </div>

              <div className="relative flex items-start gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 flex-shrink-0">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">Contrato Generado</h3>
                  <p className="text-emerald-100/80 text-sm mt-1">Su contrato esta listo para descargar</p>
                </div>
              </div>

              {/* Contract summary */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
                  <p className="text-emerald-200/60 text-xs">Servicio</p>
                  <p className="text-white font-medium text-sm mt-0.5">{service.name}</p>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
                  <p className="text-emerald-200/60 text-xs">Cliente</p>
                  <p className="text-white font-medium text-sm mt-0.5 truncate">{contractForm.clientFullName || userName || 'Cliente'}</p>
                </div>
                {contractTemplate && (() => {
                  const variant = contractTemplate.variants[selectedVariantIndex]
                  return (
                    <>
                      <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
                        <p className="text-emerald-200/60 text-xs">Costo Total</p>
                        <p className="text-white font-bold text-lg mt-0.5">${variant.totalPrice.toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
                        <p className="text-emerald-200/60 text-xs">Forma de Pago</p>
                        {contractTemplate.installments ? (
                          <p className="text-white font-medium text-sm mt-0.5">${Math.round(variant.totalPrice / 10).toLocaleString()}/mes x 10</p>
                        ) : (
                          <p className="text-white font-medium text-sm mt-0.5">Pago unico</p>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="group w-full flex items-center justify-center gap-2.5 rounded-xl border-2 border-[#002855]/15 bg-white px-5 py-4 text-[#002855] font-medium transition-all hover:border-[#002855]/30 hover:bg-[#002855]/[0.02] hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Download className="w-5 h-5 text-[#002855]/60 group-hover:text-[#002855]" />
            Descargar Contrato PDF
          </button>

          {/* ═══ PAYMENT SECTION ═══ */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-[#002855]/8">
            {/* Navy header band */}
            <div className="bg-gradient-to-r from-[#002855] via-[#002855] to-[#003570] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F2A900]/20 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-[#F2A900]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[15px]">Comience su proceso hoy</h3>
                    <p className="text-white/50 text-[11px]">Pago seguro y protegido</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10">
                  <Shield className="w-3 h-3 text-[#F2A900]" />
                  <span className="text-[10px] text-white/70 font-medium">SSL seguro</span>
                </div>
              </div>
            </div>

            {/* Price highlight strip */}
            {contractTemplate && (() => {
              const variant = contractTemplate.variants[selectedVariantIndex]
              const cuota = Math.round(variant.totalPrice / 10)
              return (
                <div className="bg-gradient-to-r from-[#FFF8E1] via-[#FFFBF0] to-[#FFF8E1] px-5 py-3 border-b border-[#F2A900]/15">
                  {contractTemplate.installments ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#002855]/70">
                        Empiece con solo
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-[#002855]">${cuota.toLocaleString()}</span>
                        <span className="text-xs text-[#002855]/50 font-medium">hoy</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#002855]/70">Pago unico</p>
                      <span className="text-2xl font-extrabold text-[#002855]">${variant.totalPrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Payment buttons */}
            <div className="bg-white p-4 space-y-3">
              {/* Stripe — primary CTA */}
              <button
                onClick={() => handleStripePayment()}
                disabled={paymentLoading}
                className="group relative w-full flex items-center gap-4 rounded-xl bg-gradient-to-r from-[#002855] to-[#003570] px-5 py-4 text-white transition-all hover:shadow-lg hover:shadow-[#002855]/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {paymentLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-[#F2A900]" />
                  )}
                </div>
                <div className="relative flex-1 text-left">
                  <span className="text-sm font-bold block">
                    {paymentLoading ? 'Procesando pago...' : 'Pagar con Tarjeta'}
                  </span>
                  {!paymentLoading && (
                    <span className="text-xs text-white/50">Visa, Mastercard, American Express</span>
                  )}
                </div>
                {!paymentLoading && (
                  <div className="relative shrink-0 flex items-center gap-1.5">
                    {contractTemplate && (
                      <span className="text-lg font-extrabold text-[#F2A900]">
                        ${contractTemplate.installments
                          ? Math.round(contractTemplate.variants[selectedVariantIndex].totalPrice / 10).toLocaleString()
                          : contractTemplate.variants[selectedVariantIndex].totalPrice.toLocaleString()
                        }
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 px-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-medium">o si prefiere</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* WhatsApp — secondary warm option */}
              <button
                onClick={handleWhatsAppPayment}
                disabled={paymentLoading}
                className="group w-full flex items-center gap-4 rounded-xl border-2 border-[#25D366]/30 bg-[#25D366]/[0.04] px-5 py-3.5 transition-all hover:border-[#25D366]/60 hover:bg-[#25D366]/[0.08] hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:pointer-events-none"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center shadow-sm shadow-[#25D366]/20 group-hover:shadow-md group-hover:shadow-[#25D366]/30 transition-shadow">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-bold text-[#002855] block">Coordinar pago con Henry</span>
                  <span className="text-xs text-[#002855]/45">WhatsApp, Zelle o Efectivo</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#25D366]/40 group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>
          </div>

          {/* ═══ START CASE — LOCKED / UNLOCKED ═══ */}
          {existingCase?.access_granted ? (
            <button
              onClick={() => router.push(`/portal/cases/${existingCase.id}/wizard`)}
              className="group relative w-full rounded-2xl bg-gradient-to-r from-[#002855] to-[#003570] p-5 text-white shadow-xl shadow-[#002855]/20 transition-all hover:shadow-2xl hover:shadow-[#002855]/30 hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#F2A900]/0 via-[#F2A900]/10 to-[#F2A900]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="relative flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5 text-[#F2A900]" />
                <span className="text-base font-semibold">Comenzar mi Caso</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ) : (
            <div className="relative w-full rounded-2xl border-2 border-[#002855]/10 bg-gradient-to-b from-[#F8FBFF] to-[#EEF2F7] p-5 overflow-hidden">
              {/* Blurred teaser background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04]">
                <FileText className="w-32 h-32 text-[#002855]" />
              </div>
              <div className="relative text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#002855]/[0.07] mx-auto">
                  <Lock className="w-5 h-5 text-[#002855]/40" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#002855]">Su caso esta listo para comenzar</p>
                  <p className="text-sm text-[#002855]/50 mt-1 leading-relaxed max-w-xs mx-auto">
                    Al completar su pago, Henry preparara sus formularios y podra comenzar inmediatamente.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 pt-1 text-[#002855]/30">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Formularios</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Documentos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Seguimiento</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ═══ CONFETTI CELEBRATION ═══ */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${8 + Math.random() * 84}%`,
                top: '-12px',
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
                backgroundColor: ['#F2A900', '#002855', '#10B981', '#BE1E2D', '#8B5CF6', '#F59E0B', '#06B6D4'][i % 7],
                animation: `confetti-fall ${2 + Math.random() * 1.5}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${Math.random() * 0.6}s forwards`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
