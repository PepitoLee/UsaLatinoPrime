'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CaseProgressBar } from '@/components/portal/CaseProgressBar'
import { WelcomeModal } from '@/components/portal/WelcomeModal'
import {
  FileText, Plus, AlertCircle, ArrowRight, Bell,
  CreditCard, Briefcase, Sparkles, Lightbulb, X,
  MessageCircle, Phone, CheckCircle, Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { IntakeStatus } from '@/types/database'

// ── Types ────────────────────────────────────────────────────────

interface DashboardCase {
  id: string
  case_number: string
  intake_status: IntakeStatus
  current_step: number
  total_steps: number | null
  correction_notes: string | null
  service: { name: string; slug: string; icon: string | null } | null
}

interface PendingPayment {
  id: string
  case_id: string
  amount: number
  due_date: string
  status: string
  installment_number: number
  total_installments: number
}

interface PortalDashboardViewProps {
  userId: string
  firstName: string
  lastName: string
  cases: DashboardCase[]
  pendingPayments: PendingPayment[]
  unreadNotifications: number
}

// ── Status Configs ───────────────────────────────────────────────

const statusLabels: Record<string, { label: string; color: string }> = {
  payment_pending: { label: 'Pendiente de Pago', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
  submitted: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  under_review: { label: 'En Revision', color: 'bg-orange-100 text-orange-800' },
  needs_correction: { label: 'Necesita Correcciones', color: 'bg-red-100 text-red-800' },
  approved_by_henry: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  filed: { label: 'Presentado', color: 'bg-emerald-100 text-emerald-800' },
}

const statusDescriptions: Record<string, string> = {
  payment_pending: 'Complete su pago para que podamos comenzar con su caso.',
  in_progress: 'Esta completando su formulario.',
  submitted: 'Su formulario ha sido enviado. Henry lo revisara en los proximos dias.',
  under_review: 'Henry esta revisando su caso. Le avisaremos cuando termine.',
  needs_correction: 'Henry reviso su caso y encontro detalles que necesitan correccion.',
  approved_by_henry: 'Su caso ha sido aprobado. Estamos preparando todo para presentarlo.',
  filed: 'Su caso ha sido presentado oficialmente.',
}

// ── Helpers ──────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos dias'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function getCaseActionHref(c: DashboardCase): string {
  if (c.intake_status === 'in_progress' || c.intake_status === 'needs_correction') {
    return `/portal/cases/${c.id}/wizard`
  }
  if (c.intake_status === 'payment_pending') {
    return `/portal/payments`
  }
  return `/portal/cases/${c.id}`
}

function getCaseActionLabel(status: IntakeStatus): { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' } {
  switch (status) {
    case 'in_progress':
      return { label: 'Continuar Llenando Formulario', variant: 'default' }
    case 'needs_correction':
      return { label: 'Corregir Formulario', variant: 'destructive' }
    case 'payment_pending':
      return { label: 'Ir a Pagos', variant: 'secondary' }
    default:
      return { label: 'Ver Detalles del Caso', variant: 'outline' }
  }
}

// ── Component ────────────────────────────────────────────────────

export function PortalDashboardView({
  userId,
  firstName,
  lastName,
  cases,
  pendingPayments,
  unreadNotifications,
}: PortalDashboardViewProps) {
  const [tipDismissed, setTipDismissed] = useState(true)
  const displayName = firstName || 'Usuario'
  const tipKey = `dashboard-tip-dismissed-${userId}`

  // Load dismissed state from localStorage (scoped per user)
  useEffect(() => {
    const dismissed = localStorage.getItem(tipKey)
    setTipDismissed(dismissed === 'true')
  }, [tipKey])

  function dismissTip() {
    setTipDismissed(true)
    localStorage.setItem(tipKey, 'true')
  }

  // Derive action banner priority
  const actionBanner = useMemo(() => {
    const correction = cases.find((c) => c.intake_status === 'needs_correction')
    if (correction) {
      return {
        type: 'correction' as const,
        borderColor: 'border-l-red-500',
        bgColor: 'bg-red-50',
        title: 'Correcciones necesarias',
        description: `Henry reviso su caso de ${correction.service?.name || 'servicio'} y encontro detalles que necesitan correccion.`,
        href: `/portal/cases/${correction.id}/wizard`,
        buttonLabel: 'Corregir Formulario',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
      }
    }

    if (pendingPayments.length > 0) {
      const next = pendingPayments[0]
      return {
        type: 'payment' as const,
        borderColor: 'border-l-amber-500',
        bgColor: 'bg-amber-50',
        title: 'Pago pendiente',
        description: `Tiene una cuota de $${Number(next.amount).toLocaleString()} ${next.due_date ? `que vence el ${format(new Date(next.due_date), "d 'de' MMMM", { locale: es })}` : 'pendiente'}.`,
        href: '/portal/payments',
        buttonLabel: 'Ir a Pagos',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      }
    }

    const inProgress = cases.find((c) => c.intake_status === 'in_progress')
    if (inProgress) {
      const step = (inProgress.current_step || 0) + 1
      const total = inProgress.total_steps || '?'
      return {
        type: 'form' as const,
        borderColor: 'border-l-blue-500',
        bgColor: 'bg-blue-50',
        title: 'Continue su formulario',
        description: `Esta en el paso ${step} de ${total} de ${inProgress.service?.name || 'su caso'}. Complete el formulario para que Henry pueda revisarlo.`,
        href: `/portal/cases/${inProgress.id}/wizard`,
        buttonLabel: 'Continuar Llenando Formulario',
        buttonClass: 'bg-[#002855] hover:bg-[#003570] text-white',
      }
    }

    if (cases.length === 0) {
      return {
        type: 'empty' as const,
        borderColor: 'border-l-[#F2A900]',
        bgColor: 'bg-[#FFFDF5]',
        title: 'Comience su proceso',
        description: 'Seleccione el servicio migratorio que necesita y empecemos juntos.',
        href: '/portal/services',
        buttonLabel: 'Ver Servicios Disponibles',
        buttonClass: 'bg-[#F2A900] hover:bg-[#D9950A] text-[#002855]',
      }
    }

    // All cases are in process (submitted, under_review, approved, filed)
    return {
      type: 'calm' as const,
      borderColor: 'border-l-green-500',
      bgColor: 'bg-green-50',
      title: 'Todo va bien',
      description: 'Sus casos estan siendo procesados. Le notificaremos cuando haya novedades. Puede revisar el estado de cada caso abajo.',
      href: null,
      buttonLabel: null,
      buttonClass: '',
    }
  }, [cases, pendingPayments])

  // Contextual tip
  const tipContent = useMemo(() => {
    if (pendingPayments.length > 0) {
      return 'Puede pagar sus cuotas con tarjeta de credito, Zelle o efectivo. Contacte a Henry por WhatsApp para coordinar.'
    }
    const hasInProgress = cases.some((c) => c.intake_status === 'in_progress')
    if (hasInProgress) {
      return 'Complete su formulario lo antes posible para agilizar su caso. Si tiene dudas, escribanos por WhatsApp.'
    }
    if (cases.length > 0) {
      return 'Si tiene preguntas sobre el estado de su caso, puede escribirnos por WhatsApp en cualquier momento.'
    }
    return 'Puede explorar nuestros servicios migratorios y comenzar su proceso hoy mismo. Henry le guiara en cada paso.'
  }, [cases, pendingPayments])

  // Stats
  const activeCasesCount = cases.length
  const nextPayment = pendingPayments[0] || null
  const hasCases = cases.length > 0

  return (
    <div className="space-y-6">
      {/* Welcome Modal (first-time users) */}
      <WelcomeModal firstName={firstName} userId={userId} />

      {/* ═══ 1. WELCOME HEADER ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF8EC] via-[#FFF3DC] to-[#FDEBD0] p-5 md:p-8">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <div className="absolute top-4 right-4 w-16 h-[1px] bg-[#F2A900]" />
          <div className="absolute top-4 right-4 w-[1px] h-16 bg-[#F2A900]" />
        </div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-[#F2A900]/10 blur-2xl" />

        {/* Tricolor line */}
        <div className="flex gap-0 mb-5 rounded-full overflow-hidden h-1 w-24">
          <div className="flex-1 bg-[#002855]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#F2A900]" />
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[#002855] tracking-tight">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-[#002855]/60 mt-1 text-sm md:text-base">
            Bienvenido a su portal de servicios migratorios
          </p>
        </div>
      </div>

      {/* ═══ 2. ACTION BANNER ═══ */}
      <Card className={`border-l-4 ${actionBanner.borderColor} ${actionBanner.bgColor} shadow-sm`}>
        <CardContent className="p-5">
          <p className="font-semibold text-[#002855] text-base">{actionBanner.title}</p>
          <p className="text-sm text-[#002855]/70 mt-1">{actionBanner.description}</p>
          {actionBanner.href && actionBanner.buttonLabel && (
            <Link href={actionBanner.href}>
              <Button className={`mt-4 py-3 px-5 text-sm font-medium rounded-xl ${actionBanner.buttonClass}`}>
                {actionBanner.buttonLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* ═══ 3. TIP CONTEXTUAL ═══ */}
      {!tipDismissed && (
        <div className="relative flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
          <Lightbulb className="w-5 h-5 text-[#F2A900] shrink-0 mt-0.5" />
          <p className="text-sm text-[#002855]/70 flex-1">{tipContent}</p>
          <button
            onClick={dismissTip}
            className="text-[#002855]/30 hover:text-[#002855]/60 transition-colors shrink-0"
            aria-label="Cerrar tip"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═══ 4. STATS RESUMEN ═══ */}
      {hasCases && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Casos Activos */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#002855]/10">
                <Briefcase className="w-5 h-5 text-[#002855]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Casos Activos</p>
                <p className="text-xl font-bold text-gray-900">{activeCasesCount}</p>
              </div>
            </CardContent>
          </Card>

          {/* Proximo Pago */}
          {nextPayment && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#F2A900]/10">
                  <CreditCard className="w-5 h-5 text-[#F2A900]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Proximo Pago</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${Number(nextPayment.amount).toLocaleString()}
                  </p>
                  {nextPayment.due_date && (
                    <p className="text-xs text-gray-400">
                      {format(new Date(nextPayment.due_date), "d MMM", { locale: es })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notificaciones */}
          {unreadNotifications > 0 && (
            <Link href="/portal/notifications">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3 h-full">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                    <Bell className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Notificaciones</p>
                    <p className="text-xl font-bold text-gray-900">{unreadNotifications}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* ═══ 5. CASE CARDS ═══ */}
      {hasCases ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#002855]">Mis Casos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {cases.map((c) => {
              const status = statusLabels[c.intake_status] || statusLabels.in_progress
              const action = getCaseActionLabel(c.intake_status)
              const description = statusDescriptions[c.intake_status] || ''
              const casePayment = pendingPayments.find((p) => p.case_id === c.id)

              return (
                <Card key={c.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Navy header */}
                  <div className="bg-gradient-to-r from-[#002855] to-[#003570] px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-semibold text-base truncate">
                          {c.service?.name || 'Servicio'}
                        </p>
                        {c.case_number && (
                          <p className="text-blue-200/60 text-xs mt-0.5">Caso #{c.case_number}</p>
                        )}
                      </div>
                      <Badge className={`${status.color} shrink-0 ml-2`}>{status.label}</Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Progress bar */}
                    <CaseProgressBar status={c.intake_status} />

                    {/* Status description */}
                    <p className="text-sm text-gray-600">
                      {c.intake_status === 'in_progress'
                        ? `${description} Va en el paso ${(c.current_step || 0) + 1} de ${c.total_steps || '?'}.`
                        : description
                      }
                    </p>

                    {/* Correction notes */}
                    {c.intake_status === 'needs_correction' && c.correction_notes && (
                      <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          {c.correction_notes.length > 150
                            ? `${c.correction_notes.substring(0, 150)}...`
                            : c.correction_notes
                          }
                        </p>
                      </div>
                    )}

                    {/* Pending payment inline */}
                    {casePayment && c.intake_status !== 'payment_pending' && (
                      <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3">
                        <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                        <p className="text-sm text-amber-800">
                          Cuota pendiente: ${Number(casePayment.amount).toLocaleString()}
                          {casePayment.due_date && (
                            <> — vence {format(new Date(casePayment.due_date), "d 'de' MMM", { locale: es })}</>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Action button */}
                    <Link href={getCaseActionHref(c)} className="block">
                      <Button
                        variant={action.variant}
                        className={`w-full py-3 text-sm font-medium rounded-xl ${
                          action.variant === 'default' ? 'bg-[#002855] hover:bg-[#003570]' : ''
                        }`}
                      >
                        {action.label}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* ═══ 6. NEW SERVICE BUTTON ═══ */}
          <Link href="/portal/services" className="block">
            <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#002855]/20 bg-white py-4 text-[#002855]/70 font-medium hover:border-[#002855]/40 hover:bg-[#002855]/[0.02] transition-all">
              <Plus className="w-5 h-5" />
              Solicitar Nuevo Servicio
            </button>
          </Link>
        </div>
      ) : (
        /* ═══ 7. EMPTY STATE ═══ */
        <Card className="border-[#F2A900]/20 bg-gradient-to-b from-[#FFFDF5] to-white shadow-lg">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F2A900]/10 mx-auto mb-5">
              <Sparkles className="w-8 h-8 text-[#F2A900]" />
            </div>
            <h3 className="text-xl font-bold text-[#002855]">
              Comience su proceso migratorio hoy
            </h3>
            <p className="text-[#002855]/60 mt-2 mb-6 max-w-md mx-auto text-sm">
              Seleccione el servicio que necesita y nosotros le guiaremos paso a paso.
              Henry se encargara de todo el proceso legal.
            </p>
            <Link href="/portal/services">
              <Button className="bg-[#F2A900] hover:bg-[#D9950A] text-[#002855] font-semibold py-3 px-8 rounded-xl text-base shadow-lg shadow-[#F2A900]/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Ver Servicios Disponibles
              </Button>
            </Link>
            <div className="mt-5">
              <a
                href="https://wa.me/18019413479?text=Hola%20Henry,%20necesito%20orientacion%20sobre%20servicios%20migratorios."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:text-[#20BD5A] font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                O escribanos por WhatsApp para orientacion
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ 8. FOOTER DE AYUDA ═══ */}
      <div className="pt-4">
        {/* Diamond divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#F2A900]/30" />
          <div className="w-2 h-2 rotate-45 bg-[#F2A900]/40" />
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#F2A900]/30" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-[#002855]/70">
            Necesita ayuda? Estamos para servirle.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://wa.me/18019413479?text=Hola%20Henry,%20necesito%20ayuda%20con%20mi%20caso."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:text-[#20BD5A] font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href="tel:+18019413479"
              className="inline-flex items-center gap-2 text-sm text-[#002855]/60 hover:text-[#002855] font-medium"
            >
              <Phone className="w-4 h-4" />
              (801) 941-3479
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
