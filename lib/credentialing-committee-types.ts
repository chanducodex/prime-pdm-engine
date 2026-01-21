/**
 * Committee Meeting & Voting Management Types
 */

export interface CommitteeMeeting {
  id: string
  name: string
  scheduledDate: string
  location: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  chairId: string
  chairName: string
  attendees: MeetingAttendee[]
  agenda: MeetingAgendaItem[]
  applications: string[] // applicationIds
  createdBy: string
  createdAt: string
}

export interface MeetingAttendee {
  userId: string
  name: string
  title: string
  role: "chair" | "member" | "observer"
  attendanceStatus: "pending" | "confirmed" | "declined" | "attended" | "absent"
  votingEligible: boolean
}

export interface MeetingAgendaItem {
  id: string
  order: number
  type: "application_review" | "policy_discussion" | "general"
  title: string
  description: string
  applicationId?: string
  estimatedMinutes: number
  status: "pending" | "in_progress" | "completed" | "deferred"
}

export interface CommitteeVote {
  id: string
  meetingId: string
  applicationId: string
  voterId: string
  voterName: string
  vote: "approve" | "deny" | "defer" | "abstain"
  comments?: string
  votedAt: string
}

export interface VotingSession {
  id: string
  meetingId: string
  applicationId: string
  status: "open" | "closed"
  openedAt: string
  closedAt?: string
  votes: CommitteeVote[]
  requiredVotes: number
  votingMembers: string[] // userIds
}
