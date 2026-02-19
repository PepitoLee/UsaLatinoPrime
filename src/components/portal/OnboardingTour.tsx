'use client'

import { useState, useEffect, useCallback } from 'react'
import { Home, FileText, CreditCard, Bell, X, ArrowRight, PartyPopper } from 'lucide-react'

const STORAGE_KEY = 'portal-onboarding-count'
const MAX_SHOWS = 5 // Show the tour this many times before stopping
const STEP_DURATION = 4500 // 4.5 seconds per step

interface TourStep {
  icon: typeof Home
  title: string
  description: string
  color: string
  bgColor: string
}

const tourSteps: TourStep[] = [
  {
    icon: Home,
    title: 'Inicio',
    description: 'Aqui vera el resumen de sus casos, pagos pendientes y que hacer a continuacion.',
    color: 'text-[#002855]',
    bgColor: 'bg-[#002855]/10',
  },
  {
    icon: FileText,
    title: 'Servicios',
    description: 'Explore los servicios migratorios disponibles y comience un nuevo proceso.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: CreditCard,
    title: 'Pagos',
    description: 'Revise sus cuotas, realice pagos con tarjeta o coordine por WhatsApp.',
    color: 'text-[#F2A900]',
    bgColor: 'bg-[#F2A900]/10',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Reciba avisos cuando Henry actualice su caso o necesite algo de usted.',
    color: 'text-red-500',
    bgColor: 'bg-red-100',
  },
]

interface OnboardingTourProps {
  /** User ID to scope localStorage per user */
  userId: string
  /** Index of the highlighted nav item (0-3), used by layout to style the sidebar */
  onStepChange?: (step: number | null) => void
}

export function OnboardingTour({ userId, onStepChange }: OnboardingTourProps) {
  const [visible, setVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [viewNumber, setViewNumber] = useState(0)

  const storageKey = `${STORAGE_KEY}-${userId}`

  // Show tour if user hasn't seen it MAX_SHOWS times yet
  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    // Handle migration from old boolean format
    const viewCount = (raw === 'true') ? MAX_SHOWS : (raw ? parseInt(raw, 10) : 0)
    const safeCount = isNaN(viewCount) ? 0 : viewCount
    setViewNumber(safeCount + 1)

    if (safeCount >= MAX_SHOWS) return

    const isFirstVisit = !localStorage.getItem(`ulp_welcome_shown-${userId}`) && !localStorage.getItem('ulp_welcome_shown')

    if (isFirstVisit) {
      // First visit: wait for WelcomeModal to close before starting
      const handleWelcomeComplete = () => {
        const timer = setTimeout(() => setVisible(true), 500)
        return () => clearTimeout(timer)
      }
      window.addEventListener('welcome-complete', handleWelcomeComplete)
      return () => window.removeEventListener('welcome-complete', handleWelcomeComplete)
    } else {
      // Returning visit: show tour directly after short delay
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [storageKey])

  // Notify parent of active step
  useEffect(() => {
    if (visible) {
      onStepChange?.(currentStep)
    } else {
      onStepChange?.(null)
    }
  }, [currentStep, visible, onStepChange])

  // Auto-advance timer
  useEffect(() => {
    if (!visible || isPaused) return

    const timer = setTimeout(() => {
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep((s) => s + 1)
      } else {
        completeTour()
      }
    }, STEP_DURATION)

    return () => clearTimeout(timer)
  }, [currentStep, visible, isPaused])

  const completeTour = useCallback(() => {
    setVisible(false)
    // Increment the view counter
    const raw = localStorage.getItem(storageKey)
    const viewCount = raw ? parseInt(raw, 10) : 0
    localStorage.setItem(storageKey, String((isNaN(viewCount) ? 0 : viewCount) + 1))
    onStepChange?.(null)
  }, [onStepChange, storageKey])

  function nextStep() {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      completeTour()
    }
  }

  if (!visible) return null

  const step = tourSteps[currentStep]
  const Icon = step.icon
  const progress = ((currentStep + 1) / tourSteps.length) * 100

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 animate-in fade-in duration-300"
        onClick={() => setIsPaused(!isPaused)}
      />

      {/* ═══ DESKTOP: Tooltip next to sidebar ═══ */}
      <div
        className="hidden md:block fixed z-50 animate-in slide-in-from-left-4 fade-in duration-300"
        style={{ left: '272px', top: `${132 + currentStep * 40}px` }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Arrow pointing left */}
        <div className="absolute left-0 top-4 -translate-x-full">
          <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-72">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-6 bg-[#F2A900]'
                      : i < currentStep
                      ? 'w-1.5 bg-[#002855]'
                      : 'w-1.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={completeTour}
              className="text-gray-300 hover:text-gray-500 transition-colors"
              aria-label="Cerrar guia"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${step.bgColor} shrink-0`}>
              <Icon className={`w-5 h-5 ${step.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#002855] text-sm">{step.title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
            </div>
          </div>

          {/* View counter hint */}
          <p className="text-[10px] text-gray-300 mt-2 text-center">
            Visita {viewNumber} de {MAX_SHOWS} — luego no volvera a aparecer
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={completeTour}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Saltar guia
            </button>
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#002855] text-white text-xs font-medium hover:bg-[#003570] transition-colors"
            >
              {currentStep < tourSteps.length - 1 ? (
                <>
                  Siguiente
                  <ArrowRight className="w-3 h-3" />
                </>
              ) : (
                <>
                  Entendido
                  <PartyPopper className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* Auto-advance progress bar */}
          {!isPaused && (
            <div className="mt-3 h-0.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F2A900]/60 rounded-full transition-none"
                style={{
                  animation: `onboarding-progress-fill ${STEP_DURATION}ms linear`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ═══ MOBILE: Pulsing ring around hamburger menu ═══ */}
      <div className="md:hidden fixed z-[60] pointer-events-none" style={{ top: '4px', left: '2px' }}>
        <div
          className="w-14 h-14 rounded-full border-[3px] border-[#F2A900]"
          style={{ animation: 'onboarding-pulse-ring 1.5s ease-in-out infinite' }}
        />
      </div>

      {/* ═══ MOBILE: Arrow + label pointing to menu ═══ */}
      <svg
        className="md:hidden fixed inset-0 z-[55] pointer-events-none w-full h-full"
      >
        {/* Curved arrow from menu down toward the card */}
        <path
          d="M 40 65 C 65 160, 80 280, 65 420"
          fill="none"
          stroke="#F2A900"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="500"
          strokeDashoffset="500"
          style={{ animation: 'onboarding-draw-arrow 1.2s ease-out forwards' }}
        />
        {/* Arrowhead triangle - bigger */}
        <polygon
          points="50,412 78,422 56,435"
          fill="#F2A900"
          style={{ animation: 'onboarding-fade-in 0.3s ease-out 1s both' }}
        />
      </svg>

      {/* ═══ MOBILE: Bottom card ═══ */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom-4 fade-in duration-300"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 max-w-md mx-auto">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-6 bg-[#F2A900]'
                      : i < currentStep
                      ? 'w-1.5 bg-[#002855]'
                      : 'w-1.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={completeTour}
              className="text-gray-300 hover:text-gray-500 transition-colors p-1"
              aria-label="Cerrar guia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${step.bgColor} shrink-0`}>
              <Icon className={`w-6 h-6 ${step.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#002855]">{step.title}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{step.description}</p>
            </div>
          </div>

          {/* View counter hint */}
          <p className="text-xs text-gray-300 mt-3 text-center">
            Visita {viewNumber} de {MAX_SHOWS} — luego no volvera a aparecer
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={completeTour}
              className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 border border-gray-200 transition-colors"
            >
              Saltar
            </button>
            <button
              onClick={nextStep}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#002855] text-white text-sm font-medium hover:bg-[#003570] transition-colors"
            >
              {currentStep < tourSteps.length - 1 ? (
                <>
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Listo!
                  <PartyPopper className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Auto-advance progress bar */}
          {!isPaused && (
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F2A900]/60 rounded-full"
                style={{
                  animation: `onboarding-progress-fill ${STEP_DURATION}ms linear`,
                }}
              />
            </div>
          )}
        </div>
      </div>

    </>
  )
}
