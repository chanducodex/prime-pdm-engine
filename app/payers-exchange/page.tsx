import { PayerExchangeTable } from "@/components/payers-exchange/payer-exchange-table"
import { mockPayerExchangeData } from "@/lib/payer-exchange-mock-data"

export default function PayersExchangePage() {
  const totalPlans = mockPayerExchangeData.response_data.length
  const activeCycles = mockPayerExchangeData.response_data.filter((item) => item.health_plan_status === "File Generation triggered").length
  const totalProviders = mockPayerExchangeData.response_data.reduce((sum, item) => sum + item.total_provider, 0)
  const notConfigured = mockPayerExchangeData.response_data.filter((item) => item.health_plan_status === "Cycle Not Configured").length

  // no trend calculations required, only display current metrics
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Payers Exchange Tracker</h1>
        <p className="text-sm text-gray-500">Monitor health plan cycles, file generation status, and provider changes</p>
      </div>

      {/* Stats Overview - Gradient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Plans - Purple */}
        <div className="rounded-lg relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-600/10 to-transparent rounded-bl-full" />
          <div className="p-6 flex items-center justify-between pb-2">
            <div className="tracking-tight text-sm font-medium text-gray-700">Total Plans</div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-purple-600"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path><path d="m7.5 4.27 9 5.15"></path></svg>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-purple-900">{totalPlans}</div>
            <div className="mt-1" />
          </div>
        </div>

        {/* Active Cycles - Green */}
        <div className="rounded-lg relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-600/10 to-transparent rounded-bl-full" />
          <div className="p-6 flex items-center justify-between pb-2">
            <div className="tracking-tight text-sm font-medium text-gray-700">Active Cycles</div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-600"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-green-900">{activeCycles}</div>
            <div className="mt-1" />
          </div>
        </div>

        {/* Total Providers - Blue */}
        <div className="rounded-lg relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-600/10 to-transparent rounded-bl-full" />
          <div className="p-6 flex items-center justify-between pb-2">
            <div className="tracking-tight text-sm font-medium text-gray-700">Total Providers</div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-600"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-blue-900">{totalProviders.toLocaleString()}</div>
            <div className="mt-1" />
          </div>
        </div>

        {/* Not Configured - Red */}
        <div className="rounded-lg relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 to-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-600/10 to-transparent rounded-bl-full" />
          <div className="p-6 flex items-center justify-between pb-2">
            <div className="tracking-tight text-sm font-medium text-gray-700">Not Configured</div>
            <div className="p-2 bg-red-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-600"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-red-900">{notConfigured}</div>
            <div className="mt-1" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <PayerExchangeTable data={mockPayerExchangeData.response_data} />
    </div>
  )
}
