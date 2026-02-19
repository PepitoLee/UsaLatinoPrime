import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await request.json()
  const { case_id, total_amount, num_installments, first_payment_date, payment_method, notes } = body

  if (!case_id || !total_amount || !num_installments) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const { data: caseData } = await supabase.from('cases').select('client_id').eq('id', case_id).single()
  if (!caseData) return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 })

  const installmentAmount = Math.round(total_amount / num_installments)
  const startDate = first_payment_date ? new Date(first_payment_date) : new Date()

  const payments = []

  // First payment: completed (already paid)
  payments.push({
    case_id,
    client_id: caseData.client_id,
    amount: installmentAmount,
    installment_number: 1,
    total_installments: num_installments,
    status: 'completed',
    payment_method: payment_method || 'manual',
    due_date: startDate.toISOString().split('T')[0],
    paid_at: new Date().toISOString(),
    notes,
  })

  // Remaining installments: pending
  for (let i = 2; i <= num_installments; i++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + (i - 1))
    payments.push({
      case_id,
      client_id: caseData.client_id,
      amount: installmentAmount,
      installment_number: i,
      total_installments: num_installments,
      status: 'pending',
      due_date: dueDate.toISOString().split('T')[0],
    })
  }

  const { data, error } = await supabase.from('payments').insert(payments).select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-grant access to the case after first payment
  await supabase
    .from('cases')
    .update({ access_granted: true })
    .eq('id', case_id)

  // Notify client
  await supabase.from('notifications').insert({
    user_id: caseData.client_id,
    case_id,
    title: 'Plan de Pagos Creado',
    message: `Se ha registrado su primer pago de $${installmentAmount} y creado un plan de ${num_installments} cuotas.`,
    type: 'payment',
  })

  return NextResponse.json({ payments: data })
}
