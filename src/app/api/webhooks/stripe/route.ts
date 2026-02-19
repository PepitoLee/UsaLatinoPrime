import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const {
      case_id,
      client_id,
      installment_number,
      total_installments,
      total_price,
      service_name,
    } = session.metadata || {}

    if (!case_id || !client_id) {
      console.error('Missing metadata in Stripe session')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const numInstallments = Number(total_installments) || 1
    const numInstallment = Number(installment_number) || 1
    const totalPrice = Number(total_price) || 0
    const installmentAmount = numInstallments > 1
      ? Math.round(totalPrice / numInstallments)
      : totalPrice

    // Insert the completed payment
    const { error: paymentError } = await supabase.from('payments').insert({
      case_id,
      client_id,
      amount: installmentAmount,
      installment_number: numInstallment,
      total_installments: numInstallments,
      status: 'completed',
      payment_method: 'stripe',
      stripe_payment_intent_id: session.payment_intent as string,
      due_date: new Date().toISOString().split('T')[0],
      paid_at: new Date().toISOString(),
    })

    if (paymentError) {
      console.error('Error inserting payment:', paymentError)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // Auto-grant access to the case after payment
    await supabase
      .from('cases')
      .update({ access_granted: true })
      .eq('id', case_id)

    // If first payment of installment plan, create pending installments (2-N)
    if (numInstallment === 1 && numInstallments > 1) {
      const pendingPayments = []
      for (let i = 2; i <= numInstallments; i++) {
        const dueDate = new Date()
        dueDate.setMonth(dueDate.getMonth() + (i - 1))
        pendingPayments.push({
          case_id,
          client_id,
          amount: installmentAmount,
          installment_number: i,
          total_installments: numInstallments,
          status: 'pending',
          due_date: dueDate.toISOString().split('T')[0],
        })
      }

      const { error: pendingError } = await supabase
        .from('payments')
        .insert(pendingPayments)

      if (pendingError) {
        console.error('Error creating pending payments:', pendingError)
      }
    }

    // Notify client
    await supabase.from('notifications').insert({
      user_id: client_id,
      case_id,
      title: 'Pago Recibido',
      message: numInstallments > 1
        ? `Su pago de cuota ${numInstallment}/${numInstallments} por $${installmentAmount} para ${service_name || 'su servicio'} ha sido procesado exitosamente.`
        : `Su pago de $${installmentAmount} para ${service_name || 'su servicio'} ha sido procesado exitosamente.`,
      type: 'payment',
    })

    // Notify admin (Henry) - find admin user
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (admins && admins.length > 0) {
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', client_id)
        .single()

      const clientName = clientProfile
        ? `${clientProfile.first_name} ${clientProfile.last_name}`
        : 'Cliente'

      await supabase.from('notifications').insert({
        user_id: admins[0].id,
        case_id,
        title: 'Nuevo Pago Recibido',
        message: `${clientName} ha pagado $${installmentAmount} (Stripe) - ${service_name || 'Servicio'}${numInstallments > 1 ? ` (cuota ${numInstallment}/${numInstallments})` : ''}.`,
        type: 'payment',
      })
    }
  }

  return NextResponse.json({ received: true })
}
