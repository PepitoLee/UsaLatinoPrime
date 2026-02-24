import { QuickContractGenerator } from '@/components/admin/QuickContractGenerator'

export default function ContratosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Generar Contrato</h1>
      <QuickContractGenerator />
    </div>
  )
}
