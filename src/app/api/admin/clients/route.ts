import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
    }

    const { clientId } = await req.json()
    if (!clientId) {
      return NextResponse.json({ error: 'clientId requerido' }, { status: 400 })
    }

    // Verify the target is a client (not admin/employee)
    const { data: target } = await service
      .from('profiles')
      .select('role')
      .eq('id', clientId)
      .single()

    if (!target || target.role !== 'client') {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Cascade delete related data
    await service.from('zelle_payments').delete().eq('user_id', clientId)
    await service.from('community_memberships').delete().eq('user_id', clientId)

    // Get case IDs to clean notifications referencing them
    const { data: cases } = await service
      .from('cases')
      .select('id')
      .eq('client_id', clientId)

    const caseIds = cases?.map(c => c.id) || []

    if (caseIds.length > 0) {
      await service.from('notifications').delete().in('case_id', caseIds)
      await service.from('payments').delete().in('case_id', caseIds)
      await service.from('case_activity').delete().in('case_id', caseIds)
    }

    await service.from('notifications').delete().eq('user_id', clientId)
    await service.from('cases').delete().eq('client_id', clientId)
    await service.from('profiles').delete().eq('id', clientId)

    // Delete auth user
    const { error: authError } = await service.auth.admin.deleteUser(clientId)
    if (authError) {
      console.error('Error deleting auth user:', authError)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting client:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
