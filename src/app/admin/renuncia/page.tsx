import { redirect } from 'next/navigation'

export default function RenunciaRedirect() {
  redirect('/admin/formularios?tab=renuncia')
}
