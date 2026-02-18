import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WelcomeModal } from '@/components/portal/WelcomeModal'
import {
  Shield, Gavel, Baby, ArrowRightLeft, Receipt, Hash, CreditCard, FileText, Car,
  Star, Clock, CheckCircle2, Users, ChevronRight, MapPin, CalendarDays, Navigation,
  Globe, Sparkles
} from 'lucide-react'

const iconMap: Record<string, any> = {
  Shield, Gavel, Baby, ArrowRightLeft, Receipt, Hash, CreditCard, FileText, Car
}

const featuredSlugs = ['cambio-de-corte', 'visa-juvenil']

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('service_catalog')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.first_name || ''

  const featured = services?.filter(s => featuredSlugs.includes(s.slug)) || []
  const regular = services?.filter(s => !featuredSlugs.includes(s.slug)) || []

  return (
    <div className="space-y-8">
      <WelcomeModal firstName={firstName} />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {firstName ? `${firstName}, ` : ''}estos son nuestros servicios
        </h1>
        <p className="text-gray-500 mt-1">
          Seleccione el servicio que necesita y lo guiaremos paso a paso
        </p>
      </div>

      {/* Trust Banner */}
      <div className="bg-[#002855] rounded-xl p-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white/90 text-sm">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#F2A900]" />
          Consulta gratuita
        </span>
        <span className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#F2A900]" />
          +500 familias ayudadas
        </span>
        <span className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#F2A900]" />
          Proceso 100% confidencial
        </span>
      </div>

      {/* Featured Services */}
      {featured.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#F2A900] fill-[#F2A900]" />
            <h2 className="text-lg font-semibold text-gray-900">Servicios Destacados</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((service) => {
              const Icon = iconMap[service.icon || 'FileText'] || FileText
              return (
                <Link key={service.id} href={`/portal/services/${service.slug}`}>
                  <Card className="relative overflow-hidden border-2 border-[#F2A900]/40 hover:border-[#F2A900] bg-gradient-to-br from-white to-amber-50/50 hover:shadow-lg hover:shadow-[#F2A900]/10 transition-all duration-300 cursor-pointer h-full group">
                    {/* Featured ribbon */}
                    <div className="absolute top-0 right-0">
                      <div className="bg-[#F2A900] text-[#002855] text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                        Popular
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-[#002855] shadow-md shrink-0">
                          <Icon className="w-6 h-6 text-[#F2A900]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#002855] transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {service.short_description}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-[#002855]">
                                ${Number(service.base_price).toLocaleString()}
                              </span>
                              {service.allow_installments && (
                                <Badge className="ml-2 bg-[#002855]/10 text-[#002855] border-0 text-[10px]">
                                  Planes de pago
                                </Badge>
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#F2A900] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                              <ChevronRight className="w-4 h-4 text-[#002855]" />
                            </div>
                          </div>
                          {service.estimated_duration && (
                            <div className="mt-3 inline-flex items-center gap-1.5 bg-[#002855]/10 rounded-full px-3 py-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#002855]" />
                              <span className="text-xs font-semibold text-[#002855]">
                                Tiempo estimado: {service.estimated_duration}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* All Other Services */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Todos los Servicios</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regular.map((service) => {
            const Icon = iconMap[service.icon || 'FileText'] || FileText
            return (
              <Link key={service.id} href={`/portal/services/${service.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg hover:border-[#002855]/30 transition-all duration-300 cursor-pointer h-full group border border-gray-200 hover:-translate-y-0.5">
                  {/* Top accent bar */}
                  <div className="h-1 bg-gradient-to-r from-[#002855] to-[#002855]/60 group-hover:to-[#F2A900] transition-all duration-500" />
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#002855]/10 to-[#002855]/5 group-hover:from-[#002855] group-hover:to-[#002855]/80 transition-all duration-300 shrink-0">
                        <Icon className="w-5 h-5 text-[#002855] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 group-hover:text-[#002855] transition-colors">
                            {service.name}
                          </h3>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F2A900] group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {service.short_description}
                        </p>
                      </div>
                    </div>

                    {/* Price + Duration bar */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#002855]">
                          ${Number(service.base_price).toLocaleString()}
                        </span>
                        {service.allow_installments && (
                          <Badge className="bg-[#F2A900]/10 text-[#9a6d00] border-0 text-[10px] font-semibold">
                            Planes de pago
                          </Badge>
                        )}
                      </div>
                      {service.estimated_duration && (
                        <div className="flex items-center gap-1.5 bg-[#002855]/5 rounded-full px-3 py-1">
                          <Clock className="w-3.5 h-3.5 text-[#002855]" />
                          <span className="text-xs font-semibold text-[#002855]">
                            {service.estimated_duration}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Office Location — Premium Design */}
      <div className="relative">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#002855] to-[#001a3a] shadow-lg shadow-[#002855]/20">
            <MapPin className="w-5 h-5 text-[#F2A900]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Visítanos en Persona</h2>
            <p className="text-xs text-gray-500">Atención personalizada en nuestra oficina</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-[#002855]/10 border border-[#002855]/10">
          {/* Top decorative bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#002855] via-[#F2A900] to-[#002855]" />

          <div className="grid md:grid-cols-[1fr,340px]">
            {/* Map with overlay frame */}
            <div className="relative h-[280px] md:h-auto md:min-h-[340px] group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.5!2d-111.7955!3d40.4285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87528a1e0e3fffff%3A0x0!2s10951+N+Town+Center+Dr%2C+Highland%2C+UT+84003!5e0!3m2!1sen!2sus!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '280px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de UsaLatinoPrime"
                className="absolute inset-0 w-full h-full"
              />
              {/* Floating badge on map */}
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-white/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-[#002855] uppercase tracking-wider">Oficina Abierta</span>
                </div>
              </div>
            </div>

            {/* Info Panel — Dark elegant design */}
            <div className="relative bg-gradient-to-br from-[#002855] via-[#002855] to-[#001230] p-7 flex flex-col justify-between overflow-hidden">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#F2A900]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F2A900]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 space-y-5">
                {/* Title */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#F2A900]" />
                    <span className="text-[10px] font-bold text-[#F2A900] uppercase tracking-[0.2em]">UsaLatinoPrime</span>
                  </div>
                  <h3 className="text-white text-xl font-bold leading-tight">
                    Nuestra Oficina
                  </h3>
                  <p className="text-blue-200/60 text-xs mt-1">Highland, Utah</p>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#F2A900]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">10951 N. Town Center Drive</p>
                    <p className="text-blue-200/70 text-sm">Highland, Utah 84003</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm shrink-0 mt-0.5">
                    <CalendarDays className="w-4 h-4 text-[#F2A900]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Lunes a Viernes</p>
                    <p className="text-[#F2A900] font-bold text-sm">9:00 AM — 5:00 PM</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Quick info tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Globe className="w-3 h-3 text-[#F2A900]" />
                    <span className="text-[11px] font-medium text-white/90">Atención en Español</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <span className="text-[11px] font-medium text-white/90">Consulta Gratis</span>
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="relative z-10 mt-6">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=10951+N+Town+Center+Drive+Highland+UT+84003"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn flex items-center justify-center gap-2.5 w-full px-5 py-3.5 bg-gradient-to-r from-[#F2A900] to-[#d4920a] text-[#002855] font-bold text-sm rounded-xl hover:from-[#ffc030] hover:to-[#F2A900] transition-all duration-300 shadow-lg shadow-[#F2A900]/20 hover:shadow-[#F2A900]/40 hover:-translate-y-0.5"
                >
                  <Navigation className="w-4 h-4 group-hover/btn:rotate-45 transition-transform duration-300" />
                  Obtener Direcciones
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer trust */}
      <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
        <p>Todos nuestros servicios incluyen seguimiento personalizado y atención en español</p>
      </div>
    </div>
  )
}
