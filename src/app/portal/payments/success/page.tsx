import { CheckCircle, CreditCard, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-lg mx-auto py-12 space-y-6">
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Pago Exitoso</h1>
          <p className="text-emerald-100/80 mt-2">
            Su pago ha sido procesado correctamente. Recibira una confirmacion en su portal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/portal/payments"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#002855]/15 bg-white px-5 py-4 text-[#002855] font-medium transition-all hover:border-[#002855]/30 hover:bg-[#002855]/[0.02] hover:-translate-y-0.5 hover:shadow-lg"
        >
          <CreditCard className="w-5 h-5" />
          Ver mis Pagos
        </Link>
        <Link
          href="/portal/dashboard"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#002855] px-5 py-4 text-white font-medium transition-all hover:bg-[#003570] hover:-translate-y-0.5 hover:shadow-lg"
        >
          Ir a mi Portal
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}
