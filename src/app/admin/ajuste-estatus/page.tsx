import { redirect } from 'next/navigation'

export default function AjusteEstatusRedirect() {
  redirect('/admin/formularios?tab=ajuste')
}
