'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WizardProgress } from './WizardProgress'
import { WizardStep } from './WizardStep'
import { DocumentUploader } from './DocumentUploader'
import { ReviewAndSign } from './ReviewAndSign'
import { useAutoSave, getLocalDraft, clearLocalDraft } from '@/hooks/useAutoSave'
import { validateStep } from '@/lib/wizard/validation'
import type { ServiceWorkflow } from '@/types/wizard'
import type { Case, Document } from '@/types/database'
import type { ValidationError } from '@/lib/wizard/validation'
import { toast } from 'sonner'
import { Save, ChevronLeft, ChevronRight, Send } from 'lucide-react'

interface WizardContainerProps {
  caseData: Case
  workflow: ServiceWorkflow
  initialDocuments: Document[]
}

export function WizardContainer({ caseData, workflow, initialDocuments }: WizardContainerProps) {
  const router = useRouter()
  const supabase = createClient()

  // Restore from localStorage if it has newer data than the DB
  const [restoredFromDraft] = useState(() => {
    const draft = getLocalDraft(caseData.id)
    if (!draft) return null
    // If draft has data and DB form_data is empty or older, use draft
    const dbKeys = Object.keys((caseData.form_data as Record<string, unknown>) || {})
    const draftKeys = Object.keys(draft.formData || {})
    if (draftKeys.length > dbKeys.length) return draft
    return null
  })

  const [currentStep, setCurrentStep] = useState(
    restoredFromDraft?.currentStep ?? caseData.current_step ?? 0
  )
  const [formData, setFormData] = useState<Record<string, unknown>>(
    restoredFromDraft?.formData ?? (caseData.form_data as Record<string, unknown>) ?? {}
  )
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [signed, setSigned] = useState(false)
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [submitting, setSubmitting] = useState(false)

  const steps = workflow.steps
  const isLastStep = currentStep === steps.length - 1
  const currentStepData = steps[currentStep]
  const isDocStep = !currentStepData?.fields || currentStepData.title.toLowerCase().includes('documento')
  const isReviewStep = currentStepData?.title.toLowerCase().includes('revisión') || currentStepData?.title.toLowerCase().includes('firma')

  useAutoSave(caseData.id, formData, currentStep, caseData.intake_status === 'in_progress' || caseData.intake_status === 'needs_correction')

  // Notify user if data was restored from local draft
  useEffect(() => {
    if (restoredFromDraft) {
      toast.info('Se restauró su progreso guardado', {
        description: 'Puede continuar donde lo dejó.',
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate completed steps on mount
  useEffect(() => {
    const completed: number[] = []
    steps.forEach((step, index) => {
      if (step.fields && step.fields.length > 0) {
        const stepErrors = validateStep(step, formData)
        if (stepErrors.length === 0) completed.push(index)
      }
    })
    setCompletedSteps(completed)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFieldChange = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => prev.filter((e) => e.key !== key))
  }, [])

  const handleNext = () => {
    // Validate current step if it has fields
    if (currentStepData?.fields && currentStepData.fields.length > 0) {
      const stepErrors = validateStep(currentStepData, formData)
      if (stepErrors.length > 0) {
        setErrors(stepErrors)
        toast.error('Complete los campos obligatorios antes de continuar')
        return
      }
      setCompletedSteps((prev) => [...new Set([...prev, currentStep])])
    }

    setErrors([])
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handlePrevious = () => {
    setErrors([])
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleStepClick = (step: number) => {
    setErrors([])
    setCurrentStep(step)
  }

  const handleDocumentUploaded = (doc: Document) => {
    setDocuments((prev) => [...prev, doc])
  }

  const handleSubmit = async () => {
    if (!signed) {
      toast.error('Debe firmar la declaración para enviar el caso')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('cases')
        .update({
          form_data: formData,
          current_step: currentStep,
          intake_status: 'submitted',
        })
        .eq('id', caseData.id)

      if (error) throw error

      // Create activity record
      await supabase.from('case_activity').insert({
        case_id: caseData.id,
        actor_id: caseData.client_id,
        action: 'form_submitted',
        description: 'El cliente completó y envió el formulario',
      })

      clearLocalDraft(caseData.id)
      toast.success('Caso enviado exitosamente', {
        description: 'Henry revisará su caso lo antes posible.',
      })
      router.push(`/portal/cases/${caseData.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Error al enviar el caso')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Caso #{caseData.case_number}
        </h1>
        <p className="text-gray-600">{workflow.name}</p>
      </div>

      <WizardProgress
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      <Card>
        <CardContent className="p-6">
          {isReviewStep ? (
            <ReviewAndSign
              steps={steps}
              formData={formData}
              onSignatureChange={setSigned}
              signed={signed}
            />
          ) : isDocStep ? (
            <DocumentUploader
              caseId={caseData.id}
              clientId={caseData.client_id}
              requiredDocuments={workflow.required_documents}
              uploadedDocuments={documents}
              onDocumentUploaded={handleDocumentUploaded}
            />
          ) : (
            <WizardStep
              step={currentStepData}
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <span className="text-sm text-gray-500 hidden sm:block">
              <Save className="w-4 h-4 inline mr-1" />
              Guardado automático
            </span>

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={!signed || submitting}
              >
                {submitting ? 'Enviando...' : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Enviar Caso
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
