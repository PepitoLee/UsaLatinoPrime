export interface PromoConfig {
  enabled: boolean
  promoKey: string
  serviceSlug: string
  bannerTitle: string
  bannerSubtitle: string
  registerCardTitle: string
  serviceBannerText: string
}

const PROMOS: Record<string, PromoConfig> = {
  'visa-juvenil': {
    enabled: true, // ← Cambiar a false para apagar la promo
    promoKey: 'visa-juvenil',
    serviceSlug: 'visa-juvenil',
    bannerTitle: 'Visa Juvenil para su hijo/a',
    bannerSubtitle: 'Henry le guiara en cada paso del proceso',
    registerCardTitle: 'Primer paso: Crear su cuenta gratis',
    serviceBannerText: '¡Ya casi esta lista! Complete el contrato para iniciar el proceso de Visa Juvenil.',
  },
}

export function getPromoConfig(key: string | null): PromoConfig | null {
  if (!key) return null
  const config = PROMOS[key]
  if (!config || !config.enabled) return null
  return config
}
