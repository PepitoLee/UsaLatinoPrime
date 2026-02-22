import { QuickContractGenerator } from '@/components/admin/QuickContractGenerator'

export default function EmployeeContractsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Generar Contratos</h1>
      <div className="max-w-2xl">
        <QuickContractGenerator />
      </div>
    </div>
  )
}
