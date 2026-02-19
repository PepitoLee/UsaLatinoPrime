import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const {
    case_id,
    service_name,
    variant_label,
    total_price,
    installments,
    installment_number,
    total_installments,
    service_slug,
  } = body

  if (!case_id || !total_price || !service_name) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const amount = installments
    ? Math.round(total_price / total_installments)
    : total_price

  const description = installments
    ? `${service_name}${variant_label ? ` (${variant_label})` : ''} - Cuota ${installment_number}/${total_installments}`
    : `${service_name}${variant_label ? ` (${variant_label})` : ''} - Pago unico`

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: description,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      case_id,
      client_id: user.id,
      installment_number: String(installment_number || 1),
      total_installments: String(total_installments || 1),
      total_price: String(total_price),
      service_name,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/services/${service_slug || ''}`,
  })

  return NextResponse.json({ sessionId: session.id, url: session.url })
}
