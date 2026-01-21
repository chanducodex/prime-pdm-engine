"use client"

import { useState } from "react"
import type { CredentialingApplication, SanctionsScreening } from "@/lib/credentialing-types"
import { mockSanctionsScreenings } from "@/lib/credentialing-mock-data"
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Calendar,
} from "lucide-react"
import type { UserContext } from "@/lib/credentialing-rbac"

interface SanctionsScreeningTabProps {
  application: CredentialingApplication
  onUpdate: (application: CredentialingApplication) => void
  currentUser: UserContext
}

export function SanctionsScreeningTab({ application }: SanctionsScreeningTabProps) {
  const [screenings] = useState<SanctionsScreening[]>(
    mockSanctionsScreenings.filter((s) => s.applicationId === application.id)
  )

  const latestScreening = screenings[screenings.length - 1]

  const getDatabaseBadge = (database: string) => {
    const labels = {
      oig_leie: "OIG LEIE",
      sam_gov: "SAM.gov",
      npdb: "NPDB",
      state_medicaid: "State Medicaid",
      state_medical_board: "State Board",
    }
    return labels[database as keyof typeof labels] || database
  }

  return (
    <div className="space-y-6">
      {/* Screening Summary */}
      <div className={`border rounded-lg p-6 ${
        latestScreening?.status === "clear"
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
          : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100"
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {latestScreening?.status === "clear" ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-amber-600" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {latestScreening?.status === "clear" ? "Clear - No Matches Found" : "Matches Require Review"}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Last screened: {latestScreening ? new Date(latestScreening.screeningDate).toLocaleDateString() : "Never"}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {latestScreening?.databases.map((db) => (
                  <span key={db} className="inline-flex items-center px-2 py-1 bg-white/60 backdrop-blur-sm rounded text-xs font-medium text-gray-700">
                    {getDatabaseBadge(db)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-colors shadow-sm">
            <Search className="w-4 h-4 inline mr-2" />
            Run Screening
          </button>
        </div>
      </div>

      {/* NCQA Compliance Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">NCQA 2026 Requirement: 30-Day Monitoring</h4>
            <p className="text-sm text-blue-800">
              Per NCQA standards effective July 2025, all providers must be screened every 30 days for Medicare/Medicaid exclusions and sanctions. Automated monthly screening ensures continuous compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Matches Found */}
      {latestScreening?.matchesFound && latestScreening.matchesFound.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Matches Found ({latestScreening.matchesFound.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {latestScreening.matchesFound.map((match) => (
              <div key={match.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        match.confidence === "high"
                          ? "bg-red-100 text-red-700"
                          : match.confidence === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {match.confidence.toUpperCase()} CONFIDENCE
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {getDatabaseBadge(match.database)}
                      </span>
                      {match.isFalsePositive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          FALSE POSITIVE
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 mb-2">{match.matchedEntity.name}</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Match Type:</span>
                        <p className="font-medium text-gray-900">{match.matchType.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Exclusion Type:</span>
                        <p className="font-medium text-gray-900">{match.matchedEntity.exclusionType}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Exclusion Date:</span>
                        <p className="font-medium text-gray-900">{new Date(match.matchedEntity.exclusionDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Investigation:</span>
                        <p className="font-medium text-gray-900">{match.investigationStatus.replace(/_/g, " ").toUpperCase()}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Reason:</span>
                        <p className="font-medium text-gray-900">{match.matchedEntity.reason}</p>
                      </div>
                    </div>

                    {match.resolution && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Resolution:</p>
                        <p className="text-sm text-gray-900">{match.resolution}</p>
                        {match.resolvedBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            Resolved by {match.resolvedBy} on {match.resolvedDate ? new Date(match.resolvedDate).toLocaleDateString() : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <button className="ml-4 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Status */}
      {latestScreening?.status === "clear" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="text-base font-semibold text-green-900 mb-1">All Databases Clear</h4>
              <p className="text-sm text-green-800">
                No matches found in any exclusion or sanctions database. Provider is cleared for network participation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Screening Notes */}
      {latestScreening?.notes && latestScreening.notes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Screening Notes</h3>
          <div className="space-y-2">
            {latestScreening.notes.map((note, idx) => (
              <p key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-gray-200">
                {note}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
