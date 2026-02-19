import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { WizardContainer } from '@/components/wizard/WizardContainer'
import { getWorkflow } from '@/lib/workflows'

export default async function WizardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: caseData } = await supabase
    .from('cases')
    .select('*, service:service_catalog(name, slug)')
    .eq('id', id)
    .eq('client_id', user.id)
    .single()

  if (!caseData) notFound()

  if (!caseData.access_granted) {
    redirect(`/portal/payments`)
  }

  if (caseData.intake_status !== 'in_progress' && caseData.intake_status !== 'needs_correction') {
    redirect(`/portal/cases/${id}`)
  }

  const workflow = getWorkflow(caseData.service?.slug || '')
  if (!workflow) notFound()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('case_id', id)

  return (
    <WizardContainer
      caseData={caseData}
      workflow={workflow}
      initialDocuments={documents || []}
    />
  )
}
