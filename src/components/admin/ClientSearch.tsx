'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
}

export function ClientSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const q = value.toLowerCase()

      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone')
        .eq('role', 'client')
        .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
        .limit(8)

      setResults(data || [])
      setOpen(true)
      setLoading(false)
    }, 300)
  }

  function handleSelect(id: string) {
    setOpen(false)
    setQuery('')
    router.push(`/admin/clients/${id}`)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar cliente..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b last:border-b-0"
            >
              <p className="text-sm font-medium text-gray-900">
                {r.first_name} {r.last_name}
              </p>
              <p className="text-xs text-gray-500">{r.email} {r.phone ? `| ${r.phone}` : ''}</p>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-3">
          <p className="text-sm text-gray-500 text-center">Sin resultados</p>
        </div>
      )}
    </div>
  )
}
