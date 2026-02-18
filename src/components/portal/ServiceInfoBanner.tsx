'use client'

import { useState } from 'react'
import {
  Info, ChevronDown, ChevronUp, DollarSign, Clock,
  ListChecks, AlertTriangle, X, Landmark
} from 'lucide-react'
import type { ServiceInfo } from '@/lib/service-info'

interface ServiceInfoBannerProps {
  serviceInfo: ServiceInfo
  serviceName: string
  henryFee: number
  installments: boolean
}

export function ServiceInfoBanner({
  serviceInfo,
  serviceName,
  henryFee,
  installments,
}: ServiceInfoBannerProps) {
  const [expanded, setExpanded] = useState(true)
  const [showStages, setShowStages] = useState(false)

  if (!serviceInfo) return null

  // Calculate total government fees
  const totalGovFees = serviceInfo.stages.reduce((sum, stage) => {
    if (!stage.filingFee || stage.filingFee === '$0 (gratis)' || stage.filingFee === 'Incluido') return sum
    const match = stage.filingFee.match(/\$[\d,]+/)
    if (match) {
      const fee = parseInt(match[0].replace(/[$,]/g, ''))
      return sum + fee
    }
    return sum
  }, 0)

  return (
    <div className="rounded-2xl border-2 border-[#F2A900]/30 bg-gradient-to-b from-[#FFFBF0] via-white to-[#F8FBFF] shadow-lg overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-[#002855] via-[#002855] to-[#003570] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#F2A900]/20">
            <Info className="w-4 h-4 text-[#F2A900]" />
          </div>
          <h3 className="text-white font-bold text-sm tracking-tight">
            Información Importante del Servicio
          </h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/70" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/70" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Quick summary — 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Timeline */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#002855]/[0.04] border border-[#002855]/[0.08]">
              <div className="p-2 rounded-lg bg-[#002855] shrink-0">
                <Clock className="w-4 h-4 text-[#F2A900]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#002855]/50 uppercase tracking-wider">Tiempo Total</p>
                <p className="text-sm font-bold text-[#002855] mt-0.5">{serviceInfo.totalTimeline}</p>
              </div>
            </div>

            {/* Henry's fee */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F2A900]/[0.06] border border-[#F2A900]/[0.15]">
              <div className="p-2 rounded-lg bg-[#F2A900] shrink-0">
                <DollarSign className="w-4 h-4 text-[#002855]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#002855]/50 uppercase tracking-wider">Servicio Henry</p>
                <p className="text-sm font-bold text-[#002855] mt-0.5">
                  ${henryFee.toLocaleString()} USD
                </p>
                {installments && (
                  <p className="text-[10px] text-[#002855]/50 mt-0.5">
                    10 cuotas de ${Math.round(henryFee / 10).toLocaleString()}/mes
                  </p>
                )}
              </div>
            </div>

            {/* Government fees */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50/60 border border-red-200/40">
              <div className="p-2 rounded-lg bg-[#BE1E2D] shrink-0">
                <Landmark className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#002855]/50 uppercase tracking-wider">Filing Fees (Gov.)</p>
                <p className="text-sm font-bold text-[#002855] mt-0.5">
                  {totalGovFees > 0 ? `~$${totalGovFees.toLocaleString()} USD` : 'Sin costo'}
                </p>
                <p className="text-[10px] text-[#BE1E2D]/70 mt-0.5">Pago directo al gobierno</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/50">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Nota:</strong> El pago a UsaLatinoPrime (${henryFee.toLocaleString()}) es por el servicio de
              acompañamiento, asesoría y preparación de documentos con Henry.{' '}
              Los <strong>filing fees gubernamentales</strong> son pagos adicionales que usted hace directamente
              a las agencias del gobierno (USCIS, IRS, Corte, etc.) y <strong>no están incluidos</strong> en el costo del servicio.
            </p>
          </div>

          {/* Stages toggle */}
          <button
            onClick={() => setShowStages(!showStages)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#002855]/[0.04] hover:bg-[#002855]/[0.07] border border-[#002855]/[0.08] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <ListChecks className="w-4 h-4 text-[#002855]" />
              <span className="text-sm font-bold text-[#002855]">
                Ver las {serviceInfo.stages.length} etapas del proceso
              </span>
            </div>
            {showStages ? (
              <ChevronUp className="w-4 h-4 text-[#002855]/50 group-hover:text-[#002855]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#002855]/50 group-hover:text-[#002855]" />
            )}
          </button>

          {/* Stages detail */}
          {showStages && (
            <div className="space-y-3">
              {serviceInfo.stages.map((stage) => (
                <div
                  key={stage.step}
                  className="relative rounded-xl border border-gray-100 bg-white p-4 hover:border-[#F2A900]/30 hover:shadow-md transition-all duration-200"
                >
                  {/* Step number + title */}
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#002855] text-white text-xs font-bold shrink-0">
                      {stage.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#002855] text-sm">{stage.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{stage.description}</p>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#002855]/5 text-[10px] font-bold text-[#002855]/70">
                          <Clock className="w-3 h-3" />
                          {stage.timeline}
                        </span>
                        {stage.formNumber && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-bold text-blue-700 border border-blue-100">
                            📋 {stage.formNumber}
                          </span>
                        )}
                        {stage.filingFee && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            stage.filingFee === '$0 (gratis)' || stage.filingFee === 'Incluido'
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            <DollarSign className="w-3 h-3" />
                            Filing Fee: {stage.filingFee}
                          </span>
                        )}
                      </div>

                      {/* Fee note */}
                      {stage.filingFeeNote && (
                        <p className="text-[11px] text-gray-400 mt-2 italic leading-relaxed">
                          {stage.filingFeeNote}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Important notes */}
              {serviceInfo.importantNotes.length > 0 && (
                <div className="rounded-xl border border-[#002855]/10 bg-[#002855]/[0.03] p-4 mt-2">
                  <h4 className="text-xs font-bold text-[#002855] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" />
                    Notas Importantes
                  </h4>
                  <ul className="space-y-1.5">
                    {serviceInfo.importantNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#002855]/70 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-[#F2A900] mt-1.5 shrink-0" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
