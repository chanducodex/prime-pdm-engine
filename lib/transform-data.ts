import type { RawChangeEvent, ChangeEvent, FieldChange, ChangeCategory } from "./types"

function extractCategory(summary: string): ChangeCategory {
  if (summary.includes("ProviderInformation")) return "ProviderInformation"
  if (summary.includes("ProviderAddress")) return "ProviderAddress"
  if (summary.includes("ProviderEducation")) return "ProviderEducation"
  if (summary.includes("ProviderLicense")) return "ProviderLicense"
  if (summary.includes("ProviderSpeciality") || summary.includes("ProviderSpecialty")) return "ProviderSpecialty"
  if (summary.includes("ProviderHealthPlan")) return "ProviderHealthPlan"
  if (summary.includes("ProviderLanguage")) return "ProviderLanguage"
  return "ProviderInformation"
}

export function transformRawData(rawEvents: RawChangeEvent[]): ChangeEvent[] {
  const transformedEvents: ChangeEvent[] = []

  rawEvents.forEach((rawEvent, providerIndex) => {
    rawEvent.changeHistory.forEach((historyEntry, entryIndex) => {
      // Process added changes
      historyEntry.added.forEach((changeGroup, groupIndex) => {
        const changes: FieldChange[] = changeGroup.map((field) => ({
          field: field.fieldName,
          before: field.oldValue || null,
          after: field.newValue || null,
        }))

        const category = extractCategory(historyEntry.summary)
        const actor = changeGroup[0]?.changedBy || "System"

        transformedEvents.push({
          eventId: `evt_${providerIndex}_${entryIndex}_add_${groupIndex}`,
          timestamp: new Date(historyEntry.changeDate).toISOString(),
          actor: {
            name: actor,
            id: `user_${actor.replace(/\./g, "_")}`,
          },
          provider: {
            name: rawEvent.summary.name,
            npi: String(rawEvent.summary.npi),
            id: `prv_${rawEvent.summary.npi}`,
          },
          category,
          changes,
        })
      })

      // Process changed fields
      historyEntry.changed.forEach((changeGroup, groupIndex) => {
        const changes: FieldChange[] = changeGroup.map((field) => ({
          field: field.fieldName,
          before: field.oldValue || null,
          after: field.newValue || null,
        }))

        const category = extractCategory(historyEntry.summary)
        const actor = changeGroup[0]?.changedBy || "System"

        transformedEvents.push({
          eventId: `evt_${providerIndex}_${entryIndex}_change_${groupIndex}`,
          timestamp: new Date(historyEntry.changeDate).toISOString(),
          actor: {
            name: actor,
            id: `user_${actor.replace(/\./g, "_")}`,
          },
          provider: {
            name: rawEvent.summary.name,
            npi: String(rawEvent.summary.npi),
            id: `prv_${rawEvent.summary.npi}`,
          },
          category,
          changes,
        })
      })

      // Process terminated fields
      historyEntry.terminate.forEach((changeGroup, groupIndex) => {
        const changes: FieldChange[] = changeGroup.map((field) => ({
          field: field.fieldName,
          before: field.oldValue || null,
          after: field.newValue || null,
        }))

        const category = extractCategory(historyEntry.summary)
        const actor = changeGroup[0]?.changedBy || "System"

        transformedEvents.push({
          eventId: `evt_${providerIndex}_${entryIndex}_term_${groupIndex}`,
          timestamp: new Date(historyEntry.changeDate).toISOString(),
          actor: {
            name: actor,
            id: `user_${actor.replace(/\./g, "_")}`,
          },
          provider: {
            name: rawEvent.summary.name,
            npi: String(rawEvent.summary.npi),
            id: `prv_${rawEvent.summary.npi}`,
          },
          category,
          changes,
        })
      })
    })
  })

  // Sort by timestamp descending (most recent first)
  return transformedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
