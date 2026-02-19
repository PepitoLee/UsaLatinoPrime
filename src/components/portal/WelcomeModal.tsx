'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Shield, Heart, FileCheck, ArrowRight, Star, Scale } from 'lucide-react'

interface WelcomeModalProps {
  firstName: string
  userId?: string
}

export function WelcomeModal({ firstName, userId }: WelcomeModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  const storageKey = userId ? `ulp_welcome_shown-${userId}` : 'ulp_welcome_shown'

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey)
    if (!dismissed) {
      // Small delay for the page to settle
      const timer = setTimeout(() => setOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [storageKey])

  function handleClose() {
    localStorage.setItem(storageKey, 'true')
    setOpen(false)
    // Signal the OnboardingTour that it can start
    window.dispatchEvent(new CustomEvent('welcome-complete'))
  }

  function handleNext() {
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const steps = [
    // Step 0: Welcome & Thanks
    {
      icon: (
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#F2A900] to-[#d4920a] flex items-center justify-center shadow-lg shadow-[#F2A900]/20">
          <Heart className="w-8 h-8 text-white" />
        </div>
      ),
      title: `${firstName ? `${firstName}, g` : 'G'}racias por confiar en nosotros`,
      body: (
        <>
          <p className="text-gray-600 leading-relaxed">
            Sabemos que dar el primer paso no es fácil. Tomar la decisión de regularizar
            tu situación migratoria requiere <strong className="text-gray-800">valentía</strong>, y el
            solo hecho de estar aquí ya dice mucho de ti y de tu familia.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            En <strong className="text-[#002855]">UsaLatinoPrime</strong> estamos comprometidos
            a caminar contigo en cada paso de este proceso.
          </p>
        </>
      ),
    },
    // Step 1: Why regularize
    {
      icon: (
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#002855] to-[#001a3a] flex items-center justify-center shadow-lg shadow-[#002855]/20">
          <Scale className="w-8 h-8 text-[#F2A900]" />
        </div>
      ),
      title: 'La importancia de regularizarte',
      body: (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-800">Protege a tu familia</strong> — Un estatus migratorio
              definido te da seguridad y estabilidad para los tuyos.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-800">Accede a más oportunidades</strong> — Trabajo con permisos,
              licencia de conducir, y acceso a servicios esenciales.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Star className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-800">El tiempo es clave</strong> — Mientras más pronto inicies
              tu proceso, más opciones legales tienes a tu favor.
            </p>
          </div>
        </div>
      ),
    },
    // Step 2: CTA
    {
      icon: (
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#F2A900] to-[#002855] flex items-center justify-center shadow-lg shadow-[#002855]/20">
          <ArrowRight className="w-8 h-8 text-white" />
        </div>
      ),
      title: 'Tu primer paso empieza hoy',
      body: (
        <>
          <p className="text-gray-600 leading-relaxed">
            Nuestros servicios más solicitados son el <strong className="text-[#002855]">Cambio de Corte</strong> y
            la <strong className="text-[#002855]">Visa Juvenil</strong>. Miles de familias
            latinas ya han iniciado su camino con nosotros.
          </p>
          <div className="mt-4 bg-[#002855]/5 rounded-xl p-4 border border-[#002855]/10">
            <p className="text-[#002855] text-sm font-medium text-center">
              Explora nuestros servicios, elige el que necesitas, y nosotros te guiamos
              paso a paso. <strong>Sin letra pequeña, sin sorpresas.</strong>
            </p>
          </div>
        </>
      ),
    },
  ]

  const current = steps[step]

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl"
      >
        {/* Top gold accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#002855] via-[#F2A900] to-[#002855]" />

        <div className="px-6 pt-6 pb-2 text-center">
          {/* Icon */}
          <div className="mb-4">
            {current.icon}
          </div>

          {/* Title */}
          <DialogTitle className="text-xl font-bold text-gray-900 text-center">
            {current.title}
          </DialogTitle>

          {/* Body */}
          <DialogDescription asChild>
            <div className="mt-4 text-left">
              {current.body}
            </div>
          </DialogDescription>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-[#F2A900]'
                    : i < step
                    ? 'w-1.5 bg-[#002855]/40'
                    : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Atrás
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`flex-1 text-white font-semibold ${
                step === 2
                  ? 'bg-gradient-to-r from-[#F2A900] to-[#d4920a] hover:from-[#d4920a] hover:to-[#b87d08]'
                  : 'bg-[#002855] hover:bg-[#001a3a]'
              }`}
            >
              {step === 2 ? 'Ver Servicios' : 'Continuar'}
              {step < 2 && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>

          {step === 0 && (
            <button
              onClick={handleClose}
              className="mt-3 text-xs text-gray-400 hover:text-gray-500 transition-colors w-full text-center"
            >
              Omitir introducción
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
