"use client"

import { useState } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  XCircle,
  Video,
  Building,
} from "lucide-react"
import type { CommitteeMeeting, MeetingAgendaItem, MeetingAttendee } from "@/lib/credentialing-committee-types"
import type { CredentialingApplication } from "@/lib/credentialing-types"

interface CommitteeMeetingSchedulerProps {
  application?: CredentialingApplication
  existingMeeting?: CommitteeMeeting
  onSave: (meeting: Partial<CommitteeMeeting>) => void
  onCancel: () => void
  currentUser: { userId: string; name: string; role: string }
}

const mockCommitteeMembers = [
  { userId: "cm-001", name: "Dr. Michael Chen", title: "Chief Medical Officer", role: "chair" },
  { userId: "cm-002", name: "Dr. Sarah Martinez", title: "Director of Quality & Safety", role: "member" },
  { userId: "cm-003", name: "Dr. James Thompson", title: "Department Chief - Medicine", role: "member" },
  { userId: "cm-004", name: "Nancy Williams, RN", title: "VP of Clinical Operations", role: "member" },
  { userId: "cm-005", name: "Robert Johnson, JD", title: "Chief Compliance Officer", role: "member" },
  { userId: "cm-006", name: "Dr. Emily Davis", title: "Medical Staff President", role: "member" },
  { userId: "cm-007", name: "Mark Anderson", title: "Risk Manager", role: "observer" },
]

export function CommitteeMeetingScheduler({
  application,
  existingMeeting,
  onSave,
  onCancel,
  currentUser,
}: CommitteeMeetingSchedulerProps) {
  const [meeting, setMeeting] = useState<Partial<CommitteeMeeting>>(
    existingMeeting || {
      name: "",
      scheduledDate: "",
      location: "",
      locationType: "in_person",
      status: "scheduled",
      chairId: currentUser.userId,
      chairName: currentUser.name,
      attendees: [],
      agenda: [],
      applications: application ? [application.id] : [],
    }
  )

  const [locationType, setLocationType] = useState<"in_person" | "virtual" | "hybrid">(
    existingMeeting?.location?.toLowerCase().includes("zoom") ? "virtual" : "in_person"
  )
  const [showAgendaForm, setShowAgendaForm] = useState(false)
  const [newAgendaItem, setNewAgendaItem] = useState<Partial<MeetingAgendaItem>>({
    type: "application_review",
    title: "",
    description: "",
    estimatedMinutes: 15,
  })

  const [showAttendeeList, setShowAttendeeList] = useState(false)

  // Add attendees from mock list
  const addAttendee = (member: (typeof mockCommitteeMembers)[0]) => {
    const attendee: MeetingAttendee = {
      userId: member.userId,
      name: member.name,
      title: member.title,
      role: member.role as "chair" | "member" | "observer",
      attendanceStatus: "pending",
      votingEligible: member.role !== "observer",
    }

    if (!meeting.attendees?.find((a) => a.userId === member.userId)) {
      setMeeting({
        ...meeting,
        attendees: [...(meeting.attendees || []), attendee],
      })
    }
  }

  const removeAttendee = (userId: string) => {
    setMeeting({
      ...meeting,
      attendees: meeting.attendees?.filter((a) => a.userId !== userId) || [],
    })
  }

  const addAgendaItem = () => {
    if (!newAgendaItem.title) return

    const agendaItem: MeetingAgendaItem = {
      id: `agenda-${Date.now()}`,
      order: (meeting.agenda?.length || 0) + 1,
      type: newAgendaItem.type as MeetingAgendaItem["type"],
      title: newAgendaItem.title,
      description: newAgendaItem.description || "",
      applicationId: newAgendaItem.applicationId,
      estimatedMinutes: newAgendaItem.estimatedMinutes || 15,
      status: "pending",
    }

    setMeeting({
      ...meeting,
      agenda: [...(meeting.agenda || []), agendaItem],
    })

    setNewAgendaItem({
      type: "application_review",
      title: "",
      description: "",
      estimatedMinutes: 15,
    })
    setShowAgendaForm(false)
  }

  const removeAgendaItem = (itemId: string) => {
    setMeeting({
      ...meeting,
      agenda: meeting.agenda?.filter((a) => a.id !== itemId) || [],
    })
  }

  const moveAgendaItem = (itemId: string, direction: "up" | "down") => {
    const agenda = [...(meeting.agenda || [])]
    const index = agenda.findIndex((a) => a.id === itemId)
    if (index < 0) return

    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= agenda.length) return

    ;[agenda[index], agenda[newIndex]] = [agenda[newIndex], agenda[index]]

    // Update order numbers
    agenda.forEach((item, idx) => {
      item.order = idx + 1
    })

    setMeeting({ ...meeting, agenda })
  }

  const calculateTotalDuration = () => {
    return meeting.agenda?.reduce((total, item) => total + item.estimatedMinutes, 0) || 0
  }

  const handleSave = () => {
    // Update location based on type
    let finalLocation = meeting.location
    if (locationType === "virtual" && !meeting.location?.toLowerCase().includes("zoom")) {
      finalLocation = "Virtual - Zoom link to be sent"
    } else if (locationType === "hybrid" && !meeting.location?.toLowerCase().includes("hybrid")) {
      finalLocation = "Hybrid - Conference Room A + Zoom"
    }

    onSave({
      ...meeting,
      location: finalLocation,
    })
  }

  const isFormValid = meeting.name && meeting.scheduledDate && meeting.location

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {existingMeeting ? "Edit Committee Meeting" : "Schedule Committee Meeting"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {application
              ? `Review for ${application.providerName}`
              : "Create a new committee meeting session"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <XCircle className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 inline mr-2" />
            {existingMeeting ? "Update Meeting" : "Schedule Meeting"}
          </button>
        </div>
      </div>

      {/* Meeting Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Meeting Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Name *
            </label>
            <input
              type="text"
              value={meeting.name}
              onChange={(e) => setMeeting({ ...meeting, name: e.target.value })}
              placeholder="e.g., January 2025 Credentialing Committee Review"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date *
            </label>
            <input
              type="date"
              value={meeting.scheduledDate?.split("T")[0]}
              onChange={(e) =>
                setMeeting({
                  ...meeting,
                  scheduledDate: new Date(e.target.value).toISOString(),
                })
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Time *
            </label>
            <input
              type="time"
              value={meeting.scheduledDate?.split("T")[1]?.substring(0, 5) || "09:00"}
              onChange={(e) => {
                const date = meeting.scheduledDate
                  ? new Date(meeting.scheduledDate)
                  : new Date()
                const [hours, minutes] = e.target.value.split(":")
                date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
                setMeeting({ ...meeting, scheduledDate: date.toISOString() })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          {/* Location Type */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Type
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocationType("in_person")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  locationType === "in_person"
                    ? "border-violet-600 bg-violet-50 text-violet-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Building className="w-4 h-4" />
                In-Person
              </button>
              <button
                onClick={() => setLocationType("virtual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  locationType === "virtual"
                    ? "border-violet-600 bg-violet-50 text-violet-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Video className="w-4 h-4" />
                Virtual
              </button>
              <button
                onClick={() => setLocationType("hybrid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  locationType === "hybrid"
                    ? "border-violet-600 bg-violet-50 text-violet-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Users className="w-4 h-4" />
                Hybrid
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <input
              type="text"
              value={meeting.location}
              onChange={(e) => setMeeting({ ...meeting, location: e.target.value })}
              placeholder={
                locationType === "virtual"
                  ? "e.g., Zoom - https://zoom.us/j/123456789"
                  : locationType === "hybrid"
                  ? "e.g., Conference Room A + Zoom"
                  : "e.g., Boardroom, 3rd Floor"
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Attendees */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <Users className="w-5 h-5 inline mr-2 text-violet-600" />
            Attendees ({meeting.attendees?.length || 0})
          </h3>
          <button
            onClick={() => setShowAttendeeList(!showAttendeeList)}
            className="px-3 py-1.5 text-sm font-medium text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Attendee
          </button>
        </div>

        {/* Add Attendee Dropdown */}
        {showAttendeeList && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Select Committee Members</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockCommitteeMembers
                .filter((m) => !meeting.attendees?.find((a) => a.userId === m.userId))
                .map((member) => (
                  <button
                    key={member.userId}
                    onClick={() => {
                      addAttendee(member)
                      setShowAttendeeList(false)
                    }}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.title}</p>
                    </div>
                    <Plus className="w-5 h-5 text-violet-600" />
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Attendee List */}
        {meeting.attendees && meeting.attendees.length > 0 ? (
          <div className="space-y-2">
            {meeting.attendees.map((attendee) => (
              <div
                key={attendee.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      attendee.role === "chair"
                        ? "bg-violet-600"
                        : attendee.role === "member"
                        ? "bg-blue-600"
                        : "bg-gray-500"
                    }`}
                  >
                    {attendee.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {attendee.name}
                      {attendee.role === "chair" && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-violet-100 text-violet-700 rounded-full">
                          Chair
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{attendee.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {attendee.votingEligible && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      Voting Member
                    </span>
                  )}
                  {attendee.attendanceStatus === "confirmed" && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      Confirmed
                    </span>
                  )}
                  <button
                    onClick={() => removeAttendee(attendee.userId)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No attendees added yet</p>
        )}
      </div>

      {/* Agenda */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Meeting Agenda</h3>
            <p className="text-sm text-gray-600 mt-1">
              Total Duration: {calculateTotalDuration()} minutes
            </p>
          </div>
          <button
            onClick={() => setShowAgendaForm(!showAgendaForm)}
            className="px-3 py-1.5 text-sm font-medium text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Agenda Item
          </button>
        </div>

        {/* Add Agenda Form */}
        {showAgendaForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newAgendaItem.title}
                  onChange={(e) =>
                    setNewAgendaItem({ ...newAgendaItem, title: e.target.value })
                  }
                  placeholder="e.g., Review of Dr. Smith's Initial Application"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newAgendaItem.type}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      type: e.target.value as MeetingAgendaItem["type"],
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="application_review">Application Review</option>
                  <option value="policy_discussion">Policy Discussion</option>
                  <option value="general">General Business</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newAgendaItem.estimatedMinutes}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      estimatedMinutes: parseInt(e.target.value) || 15,
                    })
                  }
                  min="5"
                  step="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newAgendaItem.description}
                  onChange={(e) =>
                    setNewAgendaItem({ ...newAgendaItem, description: e.target.value })
                  }
                  placeholder="Brief description of the agenda item..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3">
                <button
                  onClick={() => setShowAgendaForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addAgendaItem}
                  disabled={!newAgendaItem.title}
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Agenda
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agenda List */}
        {meeting.agenda && meeting.agenda.length > 0 ? (
          <div className="space-y-3">
            {meeting.agenda.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.order}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                      {item.estimatedMinutes} min
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.type === "application_review"
                          ? "bg-blue-100 text-blue-700"
                          : item.type === "policy_discussion"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.type.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveAgendaItem(item.id, "up")}
                    disabled={index === 0}
                    className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveAgendaItem(item.id, "down")}
                    disabled={index === meeting.agenda!.length - 1}
                    className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeAgendaItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No agenda items yet</p>
        )}
      </div>
    </div>
  )
}
