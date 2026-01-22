"use client"

import { useState } from "react"
import { Bell, Mail, AlertCircle, CheckCircle, Info, FileText, X } from "lucide-react"
import { useProviderAuth } from "@/lib/provider-auth-context"

type MessageType = "notification" | "document_rejection" | "status_change" | "approval" | "info"

interface Message {
  id: string
  type: MessageType
  title: string
  content: string
  date: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: {
    documentName?: string
    rejectionReason?: string
    newStatus?: string
  }
}

// Mock messages data - in production, this would come from an API
const mockMessages: Message[] = [
  {
    id: "1",
    type: "status_change",
    title: "Application Status Updated",
    content: "Your credentialing application has moved to 'Committee Review' stage.",
    date: "2025-01-20T10:30:00",
    read: false,
    actionUrl: "/provider-portal/application",
    actionLabel: "View Application",
    metadata: { newStatus: "committee_review" },
  },
  {
    id: "2",
    type: "document_rejection",
    title: "Document Rejected: Medical License",
    content: "Your medical license document was rejected. Please review the reason and upload a corrected version.",
    date: "2025-01-19T14:15:00",
    read: false,
    actionUrl: "/provider-portal/application",
    actionLabel: "Update Document",
    metadata: {
      documentName: "Medical License",
      rejectionReason: "Document expired. Please upload a current valid license.",
    },
  },
  {
    id: "3",
    type: "notification",
    title: "Welcome to Provider Portal",
    content: "Thank you for starting your credentialing application. Please complete the required documents to proceed.",
    date: "2025-01-15T09:00:00",
    read: true,
    actionUrl: "/provider-portal/application",
    actionLabel: "View Documents",
  },
  {
    id: "4",
    type: "info",
    title: "Uploading Tips",
    content: "For best results, upload documents as PDF files with clear, readable text. Ensure all pages are included and the document is not password protected.",
    date: "2025-01-15T09:00:00",
    read: true,
  },
]

const messageIcons: Record<MessageType, React.ComponentType<{ className?: string }>> = {
  notification: Bell,
  document_rejection: AlertCircle,
  status_change: CheckCircle,
  approval: CheckCircle,
  info: Info,
}

const messageStyles: Record<MessageType, { bg: string; border: string; icon: string }> = {
  notification: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600" },
  document_rejection: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600" },
  status_change: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600" },
  approval: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600" },
  info: { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600" },
}

export default function MessagesPage() {
  const { user } = useProviderAuth()
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [selectedType, setSelectedType] = useState<MessageType | "all">("all")

  const filteredMessages = messages.filter((msg) => {
    if (filter === "unread" && msg.read) return false
    if (selectedType !== "all" && msg.type !== selectedType) return false
    return true
  })

  const unreadCount = messages.filter((m) => !m.read).length

  const markAsRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
  }

  const markAllAsRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
  }

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "No unread messages"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Read/Unread Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === "all"
                ? "bg-violet-100 text-violet-700"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
              filter === "unread"
                ? "bg-violet-100 text-violet-700"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Message Type Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedType === "all"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setSelectedType("document_rejection")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedType === "document_rejection"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Rejections
          </button>
          <button
            onClick={() => setSelectedType("status_change")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedType === "status_change"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Status Updates
          </button>
          <button
            onClick={() => setSelectedType("info")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedType === "info"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Info
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const Icon = messageIcons[message.type]
            const styles = messageStyles[message.type]

            return (
              <div
                key={message.id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  !message.read ? "border-violet-200 shadow-sm" : "border-gray-200"
                }`}
              >
                <div className={`p-4 ${styles.bg} rounded-t-xl border-b ${styles.border}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${styles.bg}`}>
                      <Icon className={`w-5 h-5 ${styles.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{message.title}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!message.read && (
                            <span className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0" />
                          )}
                          <button
                            onClick={() => deleteMessage(message.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Delete message"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(message.date)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-gray-700">{message.content}</p>

                  {/* Additional metadata for document rejections */}
                  {message.type === "document_rejection" && message.metadata && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-red-800">{message.metadata.documentName}</p>
                          <p className="text-red-600 mt-1">{message.metadata.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  {message.actionUrl && message.actionLabel && (
                    <div className="mt-4">
                      <a
                        href={message.actionUrl}
                        onClick={() => markAsRead(message.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        {message.actionLabel}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
