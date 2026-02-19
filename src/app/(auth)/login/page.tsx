'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Shield, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Error al iniciar sesión', { description: error.message })
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Iniciar Sesión</CardTitle>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                className="h-12 text-base pl-10"
                placeholder="ejemplo: maria@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                className="h-12 text-base pl-10"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-[#F2A900] hover:underline"
                onClick={() => toast.info('Comuníquese con nosotros por WhatsApp al (801) 941-3479 para recuperar su contraseña.')}
              >
                ¿Olvidó su contraseña?
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full h-12 text-base bg-[#F2A900] hover:bg-[#D4940A] text-white font-semibold"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Sus datos están protegidos y son confidenciales</span>
          </div>
          <p className="text-sm text-gray-600 text-center">
            ¿No tiene cuenta?{' '}
            <Link href="/register" className="text-[#F2A900] hover:underline">
              Regístrese aquí
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <MessageCircle className="h-4 w-4" />
            <span>¿Necesita ayuda? Llámenos al (801) 941-3479</span>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
