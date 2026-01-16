"use client"

import { ArrowLeft, X, Link2, Plus, Minus, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ChangeEvent } from "@/lib/types"
import { categoryColors } from "@/lib/category-config"
import { useEffect, useState } from "react"

interface ChangeDetailPanelProps {
  provider: ChangeEvent | null
  onClose: () => void
  filterCategory?: string | null
}

export function ChangeDetailPanel({ provider, onClose, filterCategory }: ChangeDetailPanelProps) {
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  if (!provider) return null

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?provider=${provider.summary.npi}`
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const formatFieldName = (field: string) => {
    return field.replace(/([A-Z])/g, " $1").trim()
  }

  const filteredHistory = filterCategory
    ? provider.changeHistory.filter((history) => {
        const categoryMatch = history.summary.match(/\d+\s+(\w+)\s+(added|changed|terminate)/)
        const category = categoryMatch ? categoryMatch[1] : ""
        return category === filterCategory
      })
    : provider.changeHistory

  return (
    <aside
      className="w-[440px] border-l border-gray-200 bg-white flex flex-col h-screen"
      role="complementary"
      aria-label="Provider change history details"
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Close detail panel"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyLink}
              title={linkCopied ? "Link copied!" : "Copy link to this provider"}
              className={linkCopied ? "text-green-600" : ""}
            >
              {linkCopied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{provider.summary.name}</h2>
          <p className="text-sm text-gray-600">NPI: {provider.summary.npi}</p>
          {filterCategory ? (
            <p className="text-xs text-violet-600 mt-1 font-medium">
              Viewing {filterCategory} changes only ({filteredHistory.length} event
              {filteredHistory.length !== 1 ? "s" : ""})
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              {provider.changeHistory.length} change event{provider.changeHistory.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No {filterCategory} changes found</p>
          </div>
        ) : (
          filteredHistory.map((historyEntry, historyIndex) => {
            // Parse category from summary (e.g., "1 ProviderInformation added")
            const categoryMatch = historyEntry.summary.match(/\d+\s+(\w+)\s+(added|changed|terminate)/)
            const category = categoryMatch ? categoryMatch[1] : "Unknown"
            const action = categoryMatch ? categoryMatch[2] : "changed"
            const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.Information

            return (
              <div key={historyIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Date and summary header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">Change Date</span>
                    <span className="text-sm font-semibold text-gray-900">{historyEntry.changeDate}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className="text-xs h-5 px-2"
                      style={{
                        borderLeft: `3px solid ${color}`,
                        borderRadius: "4px",
                      }}
                    >
                      {category}
                    </Badge>
                    <span className="text-xs text-gray-600">{historyEntry.summary}</span>
                  </div>
                </div>

                {/* Added changes */}
                {historyEntry.added.length > 0 && (
                  <div className="p-4 space-y-4">
                    {historyEntry.added.map((addedGroup, groupIndex) => (
                      <div key={`added-${groupIndex}`} className="space-y-3">
                        {groupIndex > 0 && <div className="border-t border-gray-200 pt-3" />}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Plus className="h-3 w-3 mr-1" />
                            Added Record {groupIndex + 1}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {addedGroup.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="grid grid-cols-2 gap-2 text-xs">
                              <div className="font-medium text-gray-700">{formatFieldName(field.fieldName)}:</div>
                              <div className="font-mono text-gray-900 break-words bg-green-50 px-2 py-1 rounded border border-green-100">
                                {field.newValue || <span className="italic text-gray-400">empty</span>}
                              </div>
                            </div>
                          ))}
                          {addedGroup[0] && (
                            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                              Changed by: {addedGroup[0].changedBy} on {addedGroup[0].changedOn}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Changed changes */}
                {historyEntry.changed.length > 0 && (
                  <div className="p-4 space-y-4 bg-amber-50/30">
                    {historyEntry.changed.map((changedGroup, groupIndex) => (
                      <div key={`changed-${groupIndex}`} className="space-y-3">
                        {groupIndex > 0 && <div className="border-t border-amber-200 pt-3" />}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Modified Record {groupIndex + 1}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {changedGroup.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="space-y-1">
                              <div className="text-xs font-medium text-gray-700">
                                {formatFieldName(field.fieldName)}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500">Before</span>
                                  <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200 break-words">
                                    {field.oldValue || <span className="italic text-gray-400">empty</span>}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500">After</span>
                                  <div className="text-xs font-mono bg-amber-50 px-2 py-1 rounded border border-amber-200 break-words">
                                    {field.newValue || <span className="italic text-gray-400">empty</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {changedGroup[0] && (
                            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-amber-100">
                              Changed by: {changedGroup[0].changedBy} on {changedGroup[0].changedOn}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Terminated changes */}
                {historyEntry.terminate.length > 0 && (
                  <div className="p-4 space-y-4 bg-red-50/30">
                    {historyEntry.terminate.map((terminatedGroup, groupIndex) => (
                      <div key={`terminated-${groupIndex}`} className="space-y-3">
                        {groupIndex > 0 && <div className="border-t border-red-200 pt-3" />}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            <Minus className="h-3 w-3 mr-1" />
                            Terminated Record {groupIndex + 1}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {terminatedGroup.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="grid grid-cols-2 gap-2 text-xs">
                              <div className="font-medium text-gray-700">{formatFieldName(field.fieldName)}:</div>
                              <div className="font-mono text-gray-900 break-words bg-red-50 px-2 py-1 rounded border border-red-100 line-through">
                                {field.oldValue || <span className="italic text-gray-400">empty</span>}
                              </div>
                            </div>
                          ))}
                          {terminatedGroup[0] && (
                            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-red-100">
                              Changed by: {terminatedGroup[0].changedBy} on {terminatedGroup[0].changedOn}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state if no changes */}
                {historyEntry.added.length === 0 &&
                  historyEntry.changed.length === 0 &&
                  historyEntry.terminate.length === 0 && (
                    <div className="p-4 text-sm text-gray-500 italic">No detailed changes recorded</div>
                  )}
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
