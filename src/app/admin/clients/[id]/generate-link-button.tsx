'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarClock, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface GenerateLinkButtonProps {
  clientId: string
  caseId: string
}

export function GenerateLinkButton({ clientId, caseId }: GenerateLinkButtonProps) {
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/appointments/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, case_id: caseId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error al generar link')
        return
      }
      setLink(data.link)
      toast.success('Link generado')
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Link copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  if (link) {
    return (
      <div className="flex items-center gap-1">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded max-w-[120px] truncate">
          {link.split('/cita/')[1]?.slice(0, 8)}...
        </code>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
      className="h-7 text-xs"
    >
      <CalendarClock className="w-3 h-3 mr-1" />
      {loading ? '...' : 'Link Cita'}
    </Button>
  )
}
