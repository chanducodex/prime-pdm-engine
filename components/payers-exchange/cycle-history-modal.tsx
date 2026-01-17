"use client"

import { useEffect, useMemo, useState } from "react"
import { X, Download, Calendar, Clock } from "lucide-react"
import type { CycleHistoryData } from "@/lib/payer-exchange-types"
import { mockCycleHistoryData } from "@/lib/payer-exchange-mock-data"

interface CycleHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  healthPlanId: number
}

export function CycleHistoryModal({ isOpen, onClose, planName, healthPlanId }: CycleHistoryModalProps) {
  const [historyData, setHistoryData] = useState<CycleHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && healthPlanId) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        const data = mockCycleHistoryData[healthPlanId]?.response_data || []
        setHistoryData(data)
        setIsLoading(false)
      }, 300)
    }
  }, [isOpen, healthPlanId])

  const handleDownload = (excelUrl: string) => {
    // In a real app, this would trigger a file download
    console.log("Downloading:", excelUrl)
    alert(`Downloading: ${excelUrl}`)
  }

  const totalStats = useMemo(() => {
    return historyData.reduce(
      (acc, item) => ({
        additions: acc.additions + item.total_additon,
        updates: acc.updates + item.total_updates,
        terminations: acc.terminations + item.total_terminations,
      }),
      { additions: 0, updates: 0, terminations: 0 },
    )
  }, [historyData])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-xl shadow-2xl h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{planName}</h2>
              <p className="text-sm text-gray-500 mt-0.5">History of Completed Cycles</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Cards (Gradient) */}
          {historyData.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Additions */}
                <div className="rounded-lg relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-600/10 to-transparent rounded-bl-full" />
                  <div className="p-4 flex items-center justify-between pb-2">
                    <div className="tracking-tight text-xs font-medium text-gray-700">Total Additions</div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4" /></svg>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <div className="text-2xl font-bold text-green-900">{totalStats.additions.toLocaleString()}</div>
                  </div>
                </div>

                {/* Changes */}
                <div className="rounded-lg relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-600/10 to-transparent rounded-bl-full" />
                  <div className="p-4 flex items-center justify-between pb-2">
                    <div className="tracking-tight text-xs font-medium text-gray-700">Total Changes</div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581" /></svg>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <div className="text-2xl font-bold text-blue-900">{totalStats.updates.toLocaleString()}</div>
                  </div>
                </div>

                {/* Terminations */}
                <div className="rounded-lg relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 to-white">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-600/10 to-transparent rounded-bl-full" />
                  <div className="p-4 flex items-center justify-between pb-2">
                    <div className="tracking-tight text-xs font-medium text-gray-700">Total Terminations</div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H4" /></svg>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <div className="text-2xl font-bold text-red-900">{totalStats.terminations.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table Content */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-violet-600" />
              </div>
            ) : historyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Calendar className="w-12 h-12 mb-4 text-gray-400" />
                <p className="text-lg font-medium">No cycle history available</p>
                <p className="text-sm text-gray-400 mt-1">Completed cycles will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Cycle Start Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Cycle Name
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Additions
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Terminations
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Changes
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Download
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {historyData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {item.cycle_start_date}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-medium text-gray-900">{item.cycle_name}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`text-sm font-medium ${item.total_additon > 0 ? "text-green-600" : "text-gray-400"}`}
                            >
                              {item.total_additon > 0 ? item.total_additon.toLocaleString() : "0"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`text-sm font-medium ${item.total_terminations > 0 ? "text-red-600" : "text-gray-400"}`}
                            >
                              {item.total_terminations > 0 ? item.total_terminations.toLocaleString() : "0"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`text-sm font-medium ${item.total_updates > 0 ? "text-blue-600" : "text-gray-400"}`}
                            >
                              {item.total_updates > 0 ? item.total_updates.toLocaleString() : "0"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {item.details ? (
                              <button className="text-sm text-violet-600 hover:text-violet-700 hover:underline">
                                View
                              </button>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {historyData.length} {historyData.length === 1 ? "cycle" : "cycles"}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
