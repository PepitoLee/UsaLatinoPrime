import { redirect } from 'next/navigation'

export default function CambioCorteRedirect() {
  redirect('/admin/formularios?tab=cambio-corte')
}
