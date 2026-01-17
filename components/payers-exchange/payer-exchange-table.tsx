"use client"

import { useState, useMemo } from "react"
import { Search, Download, History, ChevronDown, ChevronUp } from "lucide-react"
import type { PayerExchangeData } from "@/lib/payer-exchange-types"
import { CycleHistoryModal } from "./cycle-history-modal"

interface PayerExchangeTableProps {
  data: PayerExchangeData[]
}

export function PayerExchangeTable({ data }: PayerExchangeTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PayerExchangeData
    direction: "asc" | "desc"
  } | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PayerExchangeData | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        item.health_plan_name.toLowerCase().includes(searchLower) ||
        item.health_plan_code.toLowerCase().includes(searchLower) ||
        item.health_plan_cycle_name.toLowerCase().includes(searchLower)
      )
    })
  }, [data, searchQuery])

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  const handleSort = (key: keyof PayerExchangeData) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
  }

  const getStatusBadge = (status: string, iconColor: string) => {
    let bgColor = "bg-gray-100"
    let textColor = "text-gray-700"
    let borderColor = "border-gray-200"

    if (status === "File Generation triggered") {
      bgColor = "bg-blue-50"
      textColor = "text-blue-700"
      borderColor = "border-blue-200"
    } else if (status === "Cycle Not Configured") {
      bgColor = "bg-red-50"
      textColor = "text-red-700"
      borderColor = "border-red-200"
    } else if (iconColor === "Green") {
      bgColor = "bg-green-50"
      textColor = "text-green-700"
      borderColor = "border-green-200"
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${bgColor} ${textColor} ${borderColor}`}
      >
        {status}
      </span>
    )
  }

  const handleDownload = (excelUrl: string | null) => {
    if (excelUrl) {
      // In a real app, this would trigger a file download
      console.log("Downloading:", excelUrl)
      alert(`Downloading: ${excelUrl}`)
    }
  }

  const handleHistoryClick = (plan: PayerExchangeData) => {
    setSelectedPlan(plan)
    setIsHistoryModalOpen(true)
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof PayerExchangeData }) => {
    if (sortConfig?.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-violet-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-violet-600" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by plan name, code, or cycle name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("health_plan_name")}
                >
                  <div className="flex items-center gap-2">
                    <span>Plan Name</span>
                    <SortIcon columnKey="health_plan_name" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("health_plan_cycle_name")}
                >
                  <div className="flex items-center gap-2">
                    <span>Cycle Name</span>
                    <SortIcon columnKey="health_plan_cycle_name" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("totalAddition")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Additions</span>
                    <SortIcon columnKey="totalAddition" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("totalTermination")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Terminations</span>
                    <SortIcon columnKey="totalTermination" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("totalChanges")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Changes</span>
                    <SortIcon columnKey="totalChanges" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Download
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  History
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No payers found matching your search.
                  </td>
                </tr>
              ) : (
                sortedData.map((item) => (
                  <tr key={item.health_plan_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{item.health_plan_name}</span>
                        <span className="text-xs text-gray-500">
                          {item.total_provider.toLocaleString()} Providers
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{item.health_plan_cycle_name || "—"}</span>
                        {item.health_plan_cycle_start_date && (
                          <span className="text-xs text-gray-500">{item.health_plan_cycle_start_date}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(item.health_plan_status, item.health_plan_icon_color)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {item.totalAddition > 0 ? item.totalAddition.toLocaleString() : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {item.totalTermination > 0 ? item.totalTermination.toLocaleString() : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {item.totalChanges > 0 ? item.totalChanges.toLocaleString() : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {item.excel_url ? (
                        <button
                          onClick={() => handleDownload(item.excel_url)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleHistoryClick(item)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                        title="View history"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cycle History Modal */}
      {selectedPlan && (
        <CycleHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false)
            setSelectedPlan(null)
          }}
          planName={selectedPlan.health_plan_name}
          healthPlanId={selectedPlan.health_plan_id}
        />
      )}
    </div>
  )
}
