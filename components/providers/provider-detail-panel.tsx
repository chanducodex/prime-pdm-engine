"use client"

import { useState } from "react"
import type { Provider } from "@/lib/provider-types"
import { X, Copy, Check, User, Briefcase, MapPin, GraduationCap, Award, FileText, Shield, Building2 } from "lucide-react"

interface ProviderDetailPanelProps {
  provider: Provider
  onClose: () => void
}

export function ProviderDetailPanel({ provider, onClose }: ProviderDetailPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="p-1 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
      title="Copy to clipboard"
    >
      {copiedField === fieldName ? (
        <Check className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )

  const InfoRow = ({ 
    label, 
    value, 
    copyable = false, 
    fieldName = "" 
  }: { 
    label: string
    value: string | number | undefined | null
    copyable?: boolean
    fieldName?: string
  }) => {
    const displayValue = value?.toString() || "-"
    return (
      <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500 font-medium min-w-[140px]">{label}</span>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-sm text-gray-900 text-right">{displayValue}</span>
          {copyable && displayValue !== "-" && (
            <CopyButton text={displayValue} fieldName={fieldName} />
          )}
        </div>
      </div>
    )
  }

  const fullName = `${provider.firstName} ${provider.middleName} ${provider.lastName}`.trim()

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div className="ml-auto relative w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {provider.firstName[0]}{provider.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                <p className="text-sm text-gray-500 mt-1">Provider Profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information Section */}
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <InfoRow label="Provider ID" value={provider.provider_Id} copyable fieldName="provider_id" />
                <InfoRow label="NPI" value={provider.npi} copyable fieldName="npi" />
                <InfoRow label="First Name" value={provider.firstName} copyable fieldName="first_name" />
                <InfoRow label="Middle Name" value={provider.middleName} copyable fieldName="middle_name" />
                <InfoRow label="Last Name" value={provider.lastName} copyable fieldName="last_name" />
                <InfoRow label="Provider Type" value={provider.providerType} />
                <InfoRow label="Degree" value={provider.basicInfo.degree} />
                <InfoRow label="Gender" value={provider.basicInfo.genderTypeId === 1 ? "Male" : provider.basicInfo.genderTypeId === 2 ? "Female" : "Other"} />
                <InfoRow label="Date of Birth" value={provider.basicInfo.dateOfBirth} />
              </div>
            </section>

            {/* Professional Details Section */}
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">Professional Details</h3>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <InfoRow label="Department" value={provider.basicInfo.cumc_department} />
                <InfoRow label="Credential Status" value={provider.basicInfo.cred_approval_status} />
                <InfoRow label="Degree Description" value={provider.basicInfo.degree_description} />
                <InfoRow label="CAQH ID" value={provider.basicInfo.caqhId} copyable fieldName="caqh_id" />
                <InfoRow label="Wheelchair Access" value={provider.wheelChairAccess ? "Yes" : "No"} />
              </div>
            </section>

            {/* Specialties Section */}
            {provider.specialties && provider.specialties.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <h3 className="text-base font-semibold text-gray-900">Specialties</h3>
                    <span className="ml-auto text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {provider.specialties.length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {provider.specialties.map((specialty, idx) => (
                      <div key={specialty.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{specialty.name}</p>
                        </div>
                        <CopyButton text={specialty.name} fieldName={`specialty_${idx}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Locations Section */}
            {provider.address && provider.address.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h3 className="text-base font-semibold text-gray-900">Practice Locations</h3>
                    <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {provider.address.length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {provider.address.map((addr, idx) => (
                      <div key={addr.id} className="p-4 bg-green-50 rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900">Location {idx + 1}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            addr.locationStatus?.includes("Active") 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {addr.locationStatus?.[0] || "Unknown"}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Address:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-right">{addr.addressLineFirst}</span>
                              <CopyButton text={addr.addressLineFirst} fieldName={`addr_line1_${idx}`} />
                            </div>
                          </div>
                          {addr.addressLineSecond && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Address 2:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-right">{addr.addressLineSecond}</span>
                                <CopyButton text={addr.addressLineSecond} fieldName={`addr_line2_${idx}`} />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">City:</span>
                            <span>{addr.city}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">State:</span>
                            <span>{addr.stateId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Zip Code:</span>
                            <div className="flex items-center gap-2">
                              <span>{addr.zipCode}</span>
                              <CopyButton text={addr.zipCode} fieldName={`zip_${idx}`} />
                            </div>
                          </div>
                        </div>
                        {addr.healthPlan && addr.healthPlan.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs font-medium text-gray-600 mb-2">Health Plans:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {addr.healthPlan.map((hp) => (
                                <span key={hp.id} className="text-xs px-2 py-1 bg-white border border-green-200 rounded text-gray-700">
                                  {hp.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Education Section */}
            {provider.educations && provider.educations.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-semibold text-gray-900">Education</h3>
                    <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      {provider.educations.length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {provider.educations.map((edu, idx) => (
                      <div key={edu.id} className="p-3 bg-amber-50 rounded-lg space-y-1.5">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900">{edu.schoolName}</p>
                          <CopyButton text={edu.schoolName} fieldName={`school_${idx}`} />
                        </div>
                        <p className="text-sm text-gray-600">{edu.degreeName}</p>
                        {edu.degreeEndDate && (
                          <p className="text-xs text-gray-500">Graduated: {edu.degreeEndDate}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Licenses Section */}
            {provider.license && ((provider.license.DEA && provider.license.DEA.length > 0) || (provider.license.CDS && provider.license.CDS.length > 0)) && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-600" />
                    <h3 className="text-base font-semibold text-gray-900">Licenses & Certifications</h3>
                    <span className="ml-auto text-xs font-medium text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">
                      {(provider.license.DEA?.length || 0) + (provider.license.CDS?.length || 0)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {[
                      ...(provider.license.DEA || []).map(license => ({ ...license, type: 'DEA' })),
                      ...(provider.license.CDS || []).map(license => ({ ...license, type: 'CDS' }))
                    ].map((license, idx) => (
                      <div key={`${license.type}_${license.id}`} className="p-3 bg-cyan-50 rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{license.type} License</p>
                            <p className="text-xs text-gray-500 mt-0.5">Category: {license.category}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            new Date(license.licenseExpiryDate) > new Date() 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {new Date(license.licenseExpiryDate) > new Date() ? "Active" : "Expired"}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>License Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{license.licenseNumber}</span>
                              <CopyButton text={license.licenseNumber} fieldName={`license_${idx}`} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Expiry Date:</span>
                            <span>{license.licenseExpiryDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Affiliations Section */}
            {provider.affiliations && provider.affiliations.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-semibold text-gray-900">Hospital Affiliations</h3>
                    <span className="ml-auto text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                      {provider.affiliations.length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {provider.affiliations.map((affiliation, idx) => (
                      <div key={affiliation.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{affiliation.affiliationName}</p>
                        <CopyButton text={affiliation.affiliationName} fieldName={`affiliation_${idx}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Malpractice Insurance Section */}
            {provider.malpractice && provider.malpractice.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <h3 className="text-base font-semibold text-gray-900">Malpractice Insurance</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {provider.malpractice.map((insurance, idx) => (
                      <div key={idx} className="p-3 bg-red-50 rounded-lg space-y-1.5">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900">{insurance.insurance_carrier}</p>
                          <CopyButton text={insurance.insurance_carrier} fieldName={`carrier_${idx}`} />
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Policy Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{insurance.insurance_policy_num}</span>
                              <CopyButton text={insurance.insurance_policy_num} fieldName={`policy_${idx}`} />
                            </div>
                          </div>
                          {insurance.ins_Cov_From && (
                            <div className="flex items-center justify-between">
                              <span>Coverage From:</span>
                              <span>{insurance.ins_Cov_From}</span>
                            </div>
                          )}
                          {insurance.ins_Cov_To && (
                            <div className="flex items-center justify-between">
                              <span>Coverage To:</span>
                              <span>{insurance.ins_Cov_To}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
