"use client"

import { useState } from "react"
import type { Provider, FieldConfig } from "@/lib/provider-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Save, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProviderDetailPanelProps {
  provider: Provider
  fieldConfig: FieldConfig[]
  onClose: () => void
  onUpdate: (provider: Provider) => void
}

export function ProviderDetailPanel({ provider, fieldConfig, onClose, onUpdate }: ProviderDetailPanelProps) {
  const [editedProvider, setEditedProvider] = useState(provider)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    addresses: true,
    specialties: true,
  })

  const hasChanges = JSON.stringify(provider) !== JSON.stringify(editedProvider)

  const handleSave = () => {
    onUpdate(editedProvider)
    // Show toast notification
    console.log("[v0] Saving provider changes:", editedProvider)
  }

  const handleRevert = () => {
    setEditedProvider(provider)
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const updateBasicInfo = (field: string, value: string) => {
    setEditedProvider({
      ...editedProvider,
      basicInfo: {
        ...editedProvider.basicInfo,
        [field]: value,
      },
    })
  }

  const updateProviderField = (field: string, value: string | number) => {
    setEditedProvider({
      ...editedProvider,
      [field]: value,
    })
  }

  return (
    <aside className="w-[480px] border-l bg-background flex flex-col h-screen">
      {/* Sticky Header */}
      <div className="p-6 border-b bg-background sticky top-0 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">Provider Details</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {editedProvider.firstName} {editedProvider.lastName} • NPI: {editedProvider.npi}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close detail panel">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!hasChanges} className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9]">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={handleRevert} disabled={!hasChanges}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="basic"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#7C3AED]"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="locations"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#7C3AED]"
            >
              Locations
            </TabsTrigger>
            <TabsTrigger
              value="specialties"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#7C3AED]"
            >
              Specialties
            </TabsTrigger>
            <TabsTrigger
              value="education"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#7C3AED]"
            >
              Education
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="p-6 space-y-6">
            {/* Provider Section */}
            <section>
              <button
                onClick={() => toggleSection("provider")}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="text-sm font-semibold text-foreground">Provider Information</h3>
                {expandedSections.provider ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.provider !== false && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">First Name *</label>
                      <Input
                        value={editedProvider.firstName}
                        onChange={(e) => updateProviderField("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Last Name *</label>
                      <Input
                        value={editedProvider.lastName}
                        onChange={(e) => updateProviderField("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Middle Name</label>
                    <Input
                      value={editedProvider.middleName}
                      onChange={(e) => updateProviderField("middleName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">NPI *</label>
                    <Input
                      value={editedProvider.npi}
                      onChange={(e) => updateProviderField("npi", Number.parseInt(e.target.value) || 0)}
                      type="number"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Provider Type</label>
                    <Input
                      value={editedProvider.providerType}
                      onChange={(e) => updateProviderField("providerType", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Basic Info Section */}
            <section>
              <button
                onClick={() => toggleSection("basicInfo")}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                {expandedSections.basicInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.basicInfo && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Affiliation Status</label>
                      <Input
                        value={editedProvider.basicInfo.affiliation_status}
                        onChange={(e) => updateBasicInfo("affiliation_status", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">CUMC Division</label>
                      <Input
                        value={editedProvider.basicInfo.cumc_division}
                        onChange={(e) => updateBasicInfo("cumc_division", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Degree Description</label>
                    <Input
                      value={editedProvider.basicInfo.degree_description}
                      onChange={(e) => updateBasicInfo("degree_description", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Approval Status</label>
                      <Input
                        value={editedProvider.basicInfo.cred_approval_status}
                        onChange={(e) => updateBasicInfo("cred_approval_status", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">CAQH ID</label>
                      <Input
                        value={editedProvider.basicInfo.caqhId}
                        onChange={(e) => updateBasicInfo("caqhId", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Date Hired</label>
                      <Input
                        value={editedProvider.basicInfo.date_hire}
                        onChange={(e) => updateBasicInfo("date_hire", e.target.value)}
                        placeholder="MM/DD/YYYY"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Current Exp Date</label>
                      <Input
                        value={editedProvider.basicInfo.current_exp_date}
                        onChange={(e) => updateBasicInfo("current_exp_date", e.target.value)}
                        placeholder="MM/DD/YYYY"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="locations" className="p-6 space-y-4">
            {editedProvider.address.map((addr, index) => (
              <div key={addr.id} className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-3">Location {index + 1}</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Address:</span> {addr.addressLineFirst}
                  </p>
                  {addr.addressLineSecond && <p className="text-muted-foreground">{addr.addressLineSecond}</p>}
                  <p>
                    <span className="text-muted-foreground">City, State:</span> {addr.city}, {addr.stateId}{" "}
                    {addr.zipCode}
                  </p>
                  <p>
                    <span className="text-muted-foreground">County:</span> {addr.county || "N/A"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {addr.wheelChairAccess && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-700">
                        Wheelchair Accessible
                      </span>
                    )}
                  </div>
                  {addr.healthPlan && addr.healthPlan.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Health Plans:</p>
                      {addr.healthPlan.map((hp) => (
                        <div key={hp.id} className="text-xs p-2 bg-accent rounded mb-1">
                          {hp.name} - {hp.plan_par_status}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="specialties" className="p-6 space-y-4">
            {editedProvider.specialties.map((specialty) => (
              <div key={specialty.id} className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-3">{specialty.name}</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Board Status:</span> {specialty.board_status}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Certificate Issuer:</span> {specialty.certificateIssuerName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Issue Date:</span> {specialty.issueDate}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Expiry Date:</span> {specialty.expiryDate}
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="education" className="p-6 space-y-4">
            {editedProvider.educations.map((edu) => (
              <div key={edu.id} className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-3">{edu.schoolName}</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Degree:</span> {edu.degreeName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Country:</span> {edu.country || "N/A"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Start Date:</span> {edu.degreeStartDate}
                  </p>
                  <p>
                    <span className="text-muted-foreground">End Date:</span> {edu.degreeEndDate}
                  </p>
                  {edu.status && (
                    <p>
                      <span className="text-muted-foreground">Status:</span> {edu.status}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  )
}
