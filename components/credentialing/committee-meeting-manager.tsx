"use client"

import { useState } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  FileText,
  Video,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react"
import type { CommitteeMeeting } from "@/lib/credentialing-committee-types"
import { CommitteeMeetingScheduler } from "./committee-meeting-scheduler"
import { hasPermission, CredentialingAction, CredentialingRole } from "@/lib/credentialing-rbac"

interface CommitteeMeetingManagerProps {
  currentUser: { userId: string; name: string; role: CredentialingRole }
}

const mockMeetings: CommitteeMeeting[] = [
  {
    id: "meeting-001",
    name: "January 2025 Credentialing Committee Review",
    scheduledDate: "2025-01-25T09:00:00",
    location: "Conference Room A, Medical Staff Office",
    status: "scheduled",
    chairId: "cm-001",
    chairName: "Dr. Michael Chen",
    attendees: [
      {
        userId: "cm-001",
        name: "Dr. Michael Chen",
        title: "Chief Medical Officer",
        role: "chair",
        attendanceStatus: "confirmed",
        votingEligible: true,
      },
      {
        userId: "cm-002",
        name: "Dr. Sarah Martinez",
        title: "Director of Quality & Safety",
        role: "member",
        attendanceStatus: "confirmed",
        votingEligible: true,
      },
      {
        userId: "cm-003",
        name: "Dr. James Thompson",
        title: "Department Chief - Medicine",
        role: "member",
        attendanceStatus: "pending",
        votingEligible: true,
      },
      {
        userId: "cm-004",
        name: "Nancy Williams, RN",
        title: "VP of Clinical Operations",
        role: "member",
        attendanceStatus: "confirmed",
        votingEligible: true,
      },
      {
        userId: "cm-005",
        name: "Robert Johnson, JD",
        title: "Chief Compliance Officer",
        role: "member",
        attendanceStatus: "confirmed",
        votingEligible: true,
      },
    ],
    agenda: [
      {
        id: "agenda-001",
        order: 1,
        type: "application_review",
        title: "Review of Dr. Sarah Johnson - Initial Application",
        description: "Cardiology specialist seeking initial credentials",
        applicationId: "app-001",
        estimatedMinutes: 15,
        status: "pending",
      },
      {
        id: "agenda-002",
        order: 2,
        type: "application_review",
        title: "Review of Dr. Michael Chen - Re-credentialing",
        description: "2-year re-credentialing cycle",
        applicationId: "app-002",
        estimatedMinutes: 10,
        status: "pending",
      },
      {
        id: "agenda-003",
        order: 3,
        type: "policy_discussion",
        title: "Updates to NCQA Credentialing Standards",
        description: "Review new 2025 requirements and implementation plan",
        estimatedMinutes: 20,
        status: "pending",
      },
    ],
    applications: ["app-001", "app-002"],
    createdBy: "user-001",
    createdAt: "2025-01-15T10:00:00",
  },
  {
    id: "meeting-002",
    name: "December 2024 Committee Meeting",
    scheduledDate: "2024-12-20T14:00:00",
    location: "Virtual - Zoom",
    status: "completed",
    chairId: "cm-001",
    chairName: "Dr. Michael Chen",
    attendees: [
      {
        userId: "cm-001",
        name: "Dr. Michael Chen",
        title: "Chief Medical Officer",
        role: "chair",
        attendanceStatus: "attended",
        votingEligible: true,
      },
      {
        userId: "cm-002",
        name: "Dr. Sarah Martinez",
        title: "Director of Quality & Safety",
        role: "member",
        attendanceStatus: "attended",
        votingEligible: true,
      },
      {
        userId: "cm-004",
        name: "Nancy Williams, RN",
        title: "VP of Clinical Operations",
        role: "member",
        attendanceStatus: "absent",
        votingEligible: true,
      },
    ],
    agenda: [],
    applications: [],
    createdBy: "user-001",
    createdAt: "2024-12-10T09:00:00",
  },
]

type ViewMode = "list" | "create" | "edit"
type StatusFilter = "all" | "scheduled" | "in_progress" | "completed" | "cancelled"

export function CommitteeMeetingManager({ currentUser }: CommitteeMeetingManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [meetings, setMeetings] = useState<CommitteeMeeting[]>(mockMeetings)
  const [selectedMeeting, setSelectedMeeting] = useState<CommitteeMeeting | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const canCreateMeeting = hasPermission(currentUser, CredentialingAction.SUBMIT_TO_COMMITTEE)
  const canEditMeeting = hasPermission(currentUser, CredentialingAction.EDIT_APPLICATION)

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSaveMeeting = (meetingData: Partial<CommitteeMeeting>) => {
    if (selectedMeeting) {
      // Update existing
      setMeetings(
        meetings.map((m) =>
          m.id === selectedMeeting.id ? { ...m, ...meetingData } : m
        )
      )
    } else {
      // Create new
      const newMeeting: CommitteeMeeting = {
        id: `meeting-${Date.now()}`,
        status: "scheduled",
        chairId: currentUser.userId,
        chairName: currentUser.name,
        attendees: meetingData.attendees || [],
        agenda: meetingData.agenda || [],
        applications: meetingData.applications || [],
        createdBy: currentUser.userId,
        createdAt: new Date().toISOString(),
        ...meetingData,
      } as CommitteeMeeting
      setMeetings([newMeeting, ...meetings])
    }
    setViewMode("list")
    setSelectedMeeting(undefined)
  }

  const handleDeleteMeeting = (meetingId: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      setMeetings(meetings.filter((m) => m.id !== meetingId))
    }
  }

  const getStatusBadge = (status: CommitteeMeeting["status"]) => {
    const config = {
      scheduled: {
        icon: Calendar,
        label: "Scheduled",
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      in_progress: {
        icon: Clock,
        label: "In Progress",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      },
      completed: {
        icon: CheckCircle,
        label: "Completed",
        className: "bg-green-100 text-green-700 border-green-200",
      },
      cancelled: {
        icon: XCircle,
        label: "Cancelled",
        className: "bg-red-100 text-red-700 border-red-200",
      },
    }

    const { icon: Icon, label, className } = config[status]
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border-2 ${className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    )
  }

  const getMeetingType = (location: string) => {
    const lowerLocation = location.toLowerCase()
    if (lowerLocation.includes("virtual") || lowerLocation.includes("zoom") || lowerLocation.includes("teams")) {
      return (
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <Video className="w-3.5 h-3.5" />
          Virtual
        </span>
      )
    } else if (lowerLocation.includes("hybrid")) {
      return (
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <Users className="w-3.5 h-3.5" />
          Hybrid
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1 text-xs text-gray-600">
        <MapPin className="w-3.5 h-3.5" />
        In-Person
      </span>
    )
  }

  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => {
              setViewMode("list")
              setSelectedMeeting(undefined)
            }}
            className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            ← Back to Meetings
          </button>
        </div>
        <CommitteeMeetingScheduler
          existingMeeting={selectedMeeting}
          onSave={handleSaveMeeting}
          onCancel={() => {
            setViewMode("list")
            setSelectedMeeting(undefined)
          }}
          currentUser={currentUser}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Committee Meetings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Schedule and manage credentialing committee meetings
          </p>
        </div>
        {canCreateMeeting && (
          <button
            onClick={() => setViewMode("create")}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings by name or location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Meeting List */}
      {filteredMeetings.length > 0 ? (
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{meeting.name}</h3>
                    {getStatusBadge(meeting.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(meeting.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(meeting.scheduledDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {meeting.location}
                    </div>
                    {getMeetingType(meeting.location)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEditMeeting && meeting.status === "scheduled" && (
                    <button
                      onClick={() => {
                        setSelectedMeeting(meeting)
                        setViewMode("edit")
                      }}
                      className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      title="Edit Meeting"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {canEditMeeting && meeting.status === "scheduled" && (
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Meeting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Attendees Summary */}
              <div className="flex items-center gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    {meeting.attendees.length} Attendees
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-green-600 font-medium">
                    {meeting.attendees.filter((a) => a.attendanceStatus === "confirmed").length} Confirmed
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-amber-600 font-medium">
                    {meeting.attendees.filter((a) => a.attendanceStatus === "pending").length} Pending
                  </span>
                </div>
                {meeting.agenda.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {meeting.agenda.length} Agenda Items
                    </span>
                  </div>
                )}
              </div>

              {/* Chair */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold">
                    {meeting.chairName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Meeting Chair</p>
                    <p className="font-medium text-gray-900">{meeting.chairName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {meeting.status === "scheduled" && (
                    <button className="px-3 py-1.5 text-sm font-medium text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors">
                      <Eye className="w-4 h-4 inline mr-1" />
                      View Details
                    </button>
                  )}
                  {meeting.status === "completed" && (
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Minutes
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Meetings Found</h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchQuery || statusFilter !== "all"
              ? "No meetings match your search criteria."
              : "No committee meetings scheduled yet."}
          </p>
          {canCreateMeeting && !searchQuery && statusFilter === "all" && (
            <button
              onClick={() => setViewMode("create")}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Schedule First Meeting
            </button>
          )}
        </div>
      )}
    </div>
  )
}
