"use client"

import type { Provider, FieldConfig } from "@/lib/provider-types"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface ProviderListProps {
  providers: Provider[]
  onSelectProvider: (provider: Provider) => void
  selectedProviderId?: number
  fieldConfig: FieldConfig[]
}

export function ProviderList({ providers, onSelectProvider, selectedProviderId, fieldConfig }: ProviderListProps) {
  if (providers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">No providers found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {providers.map((provider) => {
        const isSelected = provider.provider_Id === selectedProviderId
        const fullName = `${provider.firstName} ${provider.middleName} ${provider.lastName}`.trim()

        return (
          <div
            key={provider.provider_Id}
            className={`p-6 hover:bg-accent/50 transition-colors cursor-pointer ${
              isSelected ? "bg-accent border-l-4 border-l-[#7C3AED]" : ""
            }`}
            onClick={() => onSelectProvider(provider)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Provider Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[#7C3AED]">
                      {provider.firstName[0]}
                      {provider.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{fullName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">NPI: {provider.npi}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700">
                        {provider.providerType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Degree</p>
                    <p className="text-sm font-medium text-foreground">{provider.basicInfo.degree || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Department</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {provider.basicInfo.cumc_department || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-sm font-medium text-foreground">
                      {provider.basicInfo.cred_approval_status || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Locations</p>
                    <p className="text-sm font-medium text-foreground">{provider.address.length}</p>
                  </div>
                </div>

                {/* Specialties */}
                {provider.specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {provider.specialties.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty.id}
                        className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20"
                      >
                        {specialty.name}
                      </span>
                    ))}
                    {provider.specialties.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        +{provider.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
