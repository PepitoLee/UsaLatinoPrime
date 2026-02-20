'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const DB_DEBOUNCE_MS = 2000
const LOCAL_STORAGE_PREFIX = 'wizard-draft-'

interface SavedDraft {
  formData: Record<string, unknown>
  currentStep: number
  savedAt: number // timestamp
}

/**
 * Reads the locally cached wizard draft (if any).
 */
export function getLocalDraft(caseId: string): SavedDraft | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${caseId}`)
    if (!raw) return null
    return JSON.parse(raw) as SavedDraft
  } catch {
    return null
  }
}

/**
 * Clears the local draft for a case (call after successful DB submit).
 */
export function clearLocalDraft(caseId: string) {
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${caseId}`)
  } catch {
    // ignore
  }
}

export function useAutoSave(
  caseId: string,
  formData: Record<string, unknown>,
  currentStep: number,
  enabled: boolean = true
) {
  const supabase = createClient()
  const dbTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDbRef = useRef<string>('')
  const isSavingRef = useRef(false)
  // Keep latest values in refs so event listeners always see current data
  const formDataRef = useRef(formData)
  const currentStepRef = useRef(currentStep)
  const enabledRef = useRef(enabled)
  const caseIdRef = useRef(caseId)

  formDataRef.current = formData
  currentStepRef.current = currentStep
  enabledRef.current = enabled
  caseIdRef.current = caseId

  // ─── Save to localStorage (synchronous, instant, never fails) ───
  const saveToLocal = useCallback(() => {
    if (!enabledRef.current) return
    try {
      const draft: SavedDraft = {
        formData: formDataRef.current,
        currentStep: currentStepRef.current,
        savedAt: Date.now(),
      }
      localStorage.setItem(
        `${LOCAL_STORAGE_PREFIX}${caseIdRef.current}`,
        JSON.stringify(draft)
      )
    } catch {
      // localStorage full or unavailable — not critical
    }
  }, [])

  // ─── Save to Supabase DB ───
  const saveToDb = useCallback(async () => {
    if (!enabledRef.current || isSavingRef.current) return

    const dataString = JSON.stringify(formDataRef.current)
    if (dataString === lastSavedDbRef.current) return

    isSavingRef.current = true
    try {
      const { error } = await supabase
        .from('cases')
        .update({
          form_data: formDataRef.current,
          current_step: currentStepRef.current,
        })
        .eq('id', caseIdRef.current)

      if (error) throw error
      lastSavedDbRef.current = dataString
    } catch (error) {
      console.error('Auto-save DB error:', error)
      // Don't toast on every failure — localStorage has the backup
    } finally {
      isSavingRef.current = false
    }
  }, [supabase])

  // ─── On every change: save to localStorage immediately, debounce DB ───
  useEffect(() => {
    if (!enabled) return

    // Instant local save
    saveToLocal()

    // Debounced DB save
    if (dbTimeoutRef.current) clearTimeout(dbTimeoutRef.current)
    dbTimeoutRef.current = setTimeout(saveToDb, DB_DEBOUNCE_MS)

    return () => {
      if (dbTimeoutRef.current) clearTimeout(dbTimeoutRef.current)
    }
  }, [formData, currentStep, enabled, saveToLocal, saveToDb])

  // ─── visibilitychange: save to DB when user switches tabs / opens PDF ───
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden' && enabledRef.current) {
        // Save to localStorage (sync, guaranteed)
        saveToLocal()
        // Try DB save via sendBeacon for reliability on mobile
        sendBeaconSave()
      }
    }

    function handleBeforeUnload() {
      if (!enabledRef.current) return
      saveToLocal()
      sendBeaconSave()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Final save attempt on unmount
      saveToLocal()
      saveToDb()
    }
  }, [saveToLocal, saveToDb])

  // ─── sendBeacon: reliable background save that survives page unload ───
  function sendBeaconSave() {
    try {
      const dataString = JSON.stringify(formDataRef.current)
      if (dataString === lastSavedDbRef.current) return

      // We use fetch with keepalive as it's more flexible than sendBeacon
      // keepalive allows the request to outlive the page
      const url = `/api/wizard/autosave`
      const body = JSON.stringify({
        caseId: caseIdRef.current,
        formData: formDataRef.current,
        currentStep: currentStepRef.current,
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
      } else {
        fetch(url, {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {})
      }
    } catch {
      // best-effort
    }
  }

  // ─── Manual save (for explicit "Guardar" button if needed) ───
  const manualSave = useCallback(async () => {
    saveToLocal()
    await saveToDb()
    toast.success('Progreso guardado')
  }, [saveToLocal, saveToDb])

  return { save: manualSave, saveToDb, isSaving: isSavingRef.current }
}
