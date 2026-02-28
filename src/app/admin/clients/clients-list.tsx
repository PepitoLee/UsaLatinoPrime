'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
  case_count: number
}

interface ClientsListProps {
  initialClients: Client[]
}

export function ClientsList({ initialClients }: ClientsListProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = searchQuery.length < 2
    ? clients
    : clients.filter(c => {
        const q = searchQuery.toLowerCase()
        return (
          c.first_name.toLowerCase().includes(q) ||
          c.last_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
        )
      })

  async function handleDelete(client: Client) {
    if (!confirm(`¿Eliminar a ${client.first_name} ${client.last_name} (${client.email})?\n\nEsto eliminará todos sus datos asociados (casos, pagos, notificaciones). Esta acción no se puede deshacer.`)) {
      return
    }

    setDeletingId(client.id)
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ clientId: client.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Error al eliminar')
        return
      }

      setClients(prev => prev.filter(c => c.id !== client.id))
      toast.success(`${client.first_name} ${client.last_name} eliminado`)
    } catch {
      toast.error('Error de conexión')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Casos</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchQuery.length >= 2 ? 'Sin resultados para tu búsqueda' : 'No hay clientes registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/clients/${c.id}`} className="text-blue-600 hover:underline">
                        {c.first_name} {c.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell className="text-sm text-gray-500">{c.case_count}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(c.created_at), 'd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar cliente"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
