import { CalendarClock } from 'lucide-react'
import { PhoneLookup } from './phone-lookup'

export default function CitaUniversalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002855] via-[#003366] to-[#001d3d] flex items-center justify-center p-4">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-[#002855]/80 backdrop-blur border-b border-white/10 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F2A900]/20 flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-[#F2A900]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">UsaLatinoPrime</p>
            <p className="text-white/60 text-xs">Agendar Cita</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <PhoneLookup />
      </div>
    </div>
  )
}
