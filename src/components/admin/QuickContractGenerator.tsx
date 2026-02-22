'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { getInstallmentCount } from '@/lib/contracts'
import {
  FileText, PenLine, Download, Plus, X, ChevronDown,
  User, Stamp, Calendar, Baby,
} from 'lucide-react'

interface MinorData {
  fullName: string
  dob: string
  birthplace: string
  passport: string
}

interface ContractForm {
  clientFullName: string
  clientPassport: string
  clientDOB: string
  clientSignature: string
}

const SERVICE_OPTIONS = [
  { slug: 'asilo-afirmativo', label: 'Asilo Afirmativo' },
  { slug: 'asilo-defensivo', label: 'Asilo Defensivo' },
  { slug: 'ajuste-de-estatus', label: 'Ajuste de Estatus' },
  { slug: 'visa-juvenil', label: 'Visa Juvenil (SIJS)' },
  { slug: 'cambio-de-estatus', label: 'Cambio de Estatus' },
  { slug: 'cambio-de-corte', label: 'Cambio de Corte' },
  { slug: 'mociones', label: 'Mociones' },
  { slug: 'itin-number', label: 'ITIN Number' },
  { slug: 'licencia-de-conducir', label: 'Licencia de Conducir' },
  { slug: 'taxes', label: 'Declaracion de Impuestos' },
]

const emptyMinor = (): MinorData => ({ fullName: '', dob: '', birthplace: '', passport: '' })

export function QuickContractGenerator() {
  const [selectedSlug, setSelectedSlug] = useState('')
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [contractForm, setContractForm] = useState<ContractForm>({
    clientFullName: '',
    clientPassport: '',
    clientDOB: '',
    clientSignature: '',
  })
  const [minors, setMinors] = useState<MinorData[]>([emptyMinor()])
  const [generating, setGenerating] = useState(false)
  const [template, setTemplate] = useState<any>(null)

  async function handleServiceChange(slug: string) {
    setSelectedSlug(slug)
    setSelectedVariantIndex(0)
    if (!slug) {
      setTemplate(null)
      return
    }
    const { getContractTemplate } = await import('@/lib/contracts/index')
    const t = getContractTemplate(slug)
    setTemplate(t)
    if (t?.requiresMinor && minors.length === 0) {
      setMinors([emptyMinor()])
    }
  }

  function updateMinor(index: number, field: keyof MinorData, value: string) {
    setMinors(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function addMinor() {
    setMinors(prev => [...prev, emptyMinor()])
  }

  function removeMinor(index: number) {
    setMinors(prev => prev.filter((_, i) => i !== index))
  }

  async function handleGenerate() {
    if (!template || !selectedSlug) {
      toast.error('Seleccione un servicio')
      return
    }
    if (!contractForm.clientFullName.trim()) {
      toast.error('Ingrese el nombre del cliente')
      return
    }
    if (!contractForm.clientPassport.trim()) {
      toast.error('Ingrese el pasaporte del cliente')
      return
    }
    if (!contractForm.clientDOB) {
      toast.error('Ingrese la fecha de nacimiento')
      return
    }
    if (!contractForm.clientSignature.trim()) {
      toast.error('Ingrese la firma del cliente')
      return
    }
    if (template.requiresMinor && minors.some(m => !m.fullName.trim())) {
      toast.error('Ingrese el nombre de todos los menores')
      return
    }

    setGenerating(true)
    try {
      const { generateContractPDF } = await import('@/lib/pdf/generate-contract-pdf')
      const variant = template.variants[selectedVariantIndex]
      const serviceLabel = SERVICE_OPTIONS.find(s => s.slug === selectedSlug)?.label || selectedSlug

      const pdf = generateContractPDF({
        serviceName: serviceLabel,
        totalPrice: variant.totalPrice,
        installments: template.installments,
        installmentCount: getInstallmentCount(variant),
        clientFullName: contractForm.clientFullName.trim(),
        clientPassport: contractForm.clientPassport.trim(),
        clientDOB: contractForm.clientDOB,
        clientSignature: contractForm.clientSignature.trim(),
        objetoDelContrato: template.objetoDelContrato,
        etapas: template.etapas,
        ...(template.requiresMinor && {
          minors: minors.map(m => ({
            fullName: m.fullName.trim(),
            dob: m.dob,
            birthplace: m.birthplace.trim(),
            passport: m.passport.trim(),
          })),
        }),
      })

      const arrayBuffer = pdf.output('arraybuffer')
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Contrato-${selectedSlug}-${contractForm.clientFullName.replace(/\s+/g, '_')}.pdf`
      link.type = 'application/pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)

      toast.success('Contrato generado exitosamente')
    } catch (error: any) {
      console.error('PDF generation error:', error)
      toast.error(`Error al generar el PDF: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  function handleReset() {
    setSelectedSlug('')
    setSelectedVariantIndex(0)
    setTemplate(null)
    setContractForm({ clientFullName: '', clientPassport: '', clientDOB: '', clientSignature: '' })
    setMinors([emptyMinor()])
  }

  return (
    <Card className="border-[#F2A900]/30 bg-gradient-to-br from-white to-[#FFFBF0]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#002855]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F2A900]/10">
            <FileText className="w-4 h-4 text-[#F2A900]" />
          </div>
          Generar Contrato Rapido
        </CardTitle>
        <p className="text-sm text-gray-500">
          Genere un contrato PDF sin necesidad de crear una cuenta de cliente
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service selector */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#002855]">
            Servicio <span className="text-[#F2A900]">*</span>
          </Label>
          <div className="relative">
            <select
              value={selectedSlug}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm focus:border-[#002855] focus:ring-1 focus:ring-[#002855]/20 appearance-none cursor-pointer"
            >
              <option value="">Seleccione un servicio...</option>
              {SERVICE_OPTIONS.map(s => (
                <option key={s.slug} value={s.slug}>{s.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Variant selector (if multiple) */}
        {template && template.variants.length > 1 && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#002855]">Variante</Label>
            <div className="flex gap-2">
              {template.variants.map((v: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedVariantIndex(i)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedVariantIndex === i
                      ? 'border-[#002855] bg-[#002855] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {v.label} — ${v.totalPrice.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price display (single variant) */}
        {template && template.variants.length === 1 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#002855]/5 border border-[#002855]/10">
            <span className="text-sm text-[#002855]/70">Precio:</span>
            <span className="text-sm font-bold text-[#002855]">${template.variants[0].totalPrice.toLocaleString()} USD</span>
            {template.installments && (
              <span className="text-xs text-gray-500 ml-1">({getInstallmentCount(template.variants[0])} cuotas de ${Math.round(template.variants[0].totalPrice / getInstallmentCount(template.variants[0])).toLocaleString()})</span>
            )}
          </div>
        )}

        {/* Show form only when service is selected */}
        {template && (
          <>
            {/* Client info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#002855] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Nombre completo <span className="text-[#F2A900]">*</span>
                </Label>
                <Input
                  placeholder="Nombre y apellidos"
                  value={contractForm.clientFullName}
                  onChange={(e) => setContractForm({ ...contractForm, clientFullName: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#002855] flex items-center gap-1.5">
                  <Stamp className="w-3.5 h-3.5 text-gray-400" />
                  Pasaporte <span className="text-[#F2A900]">*</span>
                </Label>
                <Input
                  placeholder="Ej: A12345678"
                  value={contractForm.clientPassport}
                  onChange={(e) => setContractForm({ ...contractForm, clientPassport: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#002855] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Fecha de nacimiento <span className="text-[#F2A900]">*</span>
                </Label>
                <Input
                  type="date"
                  value={contractForm.clientDOB}
                  onChange={(e) => setContractForm({ ...contractForm, clientDOB: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#002855] flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5 text-gray-400" />
                  Firma (nombre completo) <span className="text-[#F2A900]">*</span>
                </Label>
                <Input
                  placeholder="Escriba el nombre como firma"
                  value={contractForm.clientSignature}
                  onChange={(e) => setContractForm({ ...contractForm, clientSignature: e.target.value })}
                  className="h-10 rounded-lg font-serif italic"
                />
              </div>
            </div>

            {/* Minors section */}
            {template.requiresMinor && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-[#002855]/50" />
                  <span className="text-sm font-semibold text-[#002855]/70">Menores Beneficiarios</span>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#002855] text-white text-[10px] font-bold">
                    {minors.length}
                  </span>
                </div>

                {minors.map((minor, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#002855]">Hijo/a #{index + 1}</p>
                      {minors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMinor(index)}
                          className="flex items-center justify-center w-6 h-6 rounded border border-red-200 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        placeholder="Nombre completo del menor *"
                        value={minor.fullName}
                        onChange={(e) => updateMinor(index, 'fullName', e.target.value)}
                        className="h-9 rounded-lg text-sm bg-white"
                      />
                      <Input
                        type="date"
                        placeholder="Fecha de nacimiento"
                        value={minor.dob}
                        onChange={(e) => updateMinor(index, 'dob', e.target.value)}
                        className="h-9 rounded-lg text-sm bg-white"
                      />
                      <Input
                        placeholder="Lugar de nacimiento"
                        value={minor.birthplace}
                        onChange={(e) => updateMinor(index, 'birthplace', e.target.value)}
                        className="h-9 rounded-lg text-sm bg-white"
                      />
                      <Input
                        placeholder="Pasaporte del menor"
                        value={minor.passport}
                        onChange={(e) => updateMinor(index, 'passport', e.target.value)}
                        className="h-9 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMinor}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#F2A900]/30 hover:border-[#F2A900] bg-[#FFFBF0] hover:bg-[#FFF8E1] px-3 py-2 text-xs font-medium text-[#002855]/60 hover:text-[#002855] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar otro hijo/a
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 bg-[#F2A900] hover:bg-[#D4940A] text-white font-semibold h-11 rounded-lg"
              >
                {generating ? 'Generando...' : (
                  <>
                    <Download className="w-4 h-4 mr-1.5" />
                    Descargar Contrato PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-11 rounded-lg"
              >
                Limpiar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
