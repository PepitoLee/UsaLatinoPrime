import { redirect } from 'next/navigation'

export default function AsiloRedirect() {
  redirect('/admin/formularios?tab=asilo')
}
