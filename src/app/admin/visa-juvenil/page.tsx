import { redirect } from 'next/navigation'

export default function VisaJuvenilRedirect() {
  redirect('/admin/formularios?tab=visa-juvenil')
}
