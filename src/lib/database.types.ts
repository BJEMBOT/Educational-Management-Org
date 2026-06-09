export type GoalCategory = 'academic' | 'financial' | 'staffing' | 'operations'
export type GoalStatus = 'on_track' | 'at_risk' | 'off_track'
export type InterventionStatus = 'open' | 'resolved'
export type UserRole =
  | 'admin'
  | 'regional_manager'
  | 'staff'
  | 'teacher'
  | 'coach'
  | 'consultant'
  | 'partner'
  | 'parent'
  | 'board_member'
  | 'developer'
export type PartnerUserType = 'employee' | 'administrator'
export type RevenueSource = 'contract' | 'pd' | 'consulting' | 'grant' | 'other'
export type SchoolHealth = 'healthy' | 'at_risk' | 'off_track'
export type GrowthPlanStatus = 'draft' | 'active' | 'completed'
export type GoalItemStatus = 'not_started' | 'in_progress' | 'completed'
export type CoachingCycleStatus = 'active' | 'completed' | 'paused'
export type TeachingEvaluation =
  | 'exemplary'
  | 'effective'
  | 'developing'
  | 'needs_improvement'
export type CheckInFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
export type FrequencySource = 'evaluation_default' | 'coach_override'
export type CoachingSupportLevel = 'high' | 'standard' | 'light'
export type CoachingCheckInStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed'
export type ObservationType = 'walkthrough' | 'formal' | 'informal'
export type EvaluationCycleType = 'quarterly' | 'semester' | 'annual'
export type EvaluationCycleStatus =
  | 'draft'
  | 'active'
  | 'mid_year_review'
  | 'completed'
  | 'archived'
export type RubricRating =
  | 'exemplary'
  | 'effective'
  | 'developing'
  | 'needs_improvement'
export type ArtifactType =
  | 'lesson_plan'
  | 'assessment'
  | 'student_work'
  | 'pd_certificate'
  | 'communication_log'
  | 'other'
export type PdEventStatus = 'scheduled' | 'completed' | 'cancelled'
export type PdRegistrationStatus = 'registered' | 'attended' | 'cancelled' | 'no_show'
export type CertificationStatus = 'active' | 'expiring' | 'expired'
export type CertificationRenewalStatus = 'pending' | 'approved' | 'rejected'
export type PartnerType = 'consultant' | 'vendor'
export type PartnerStatus = 'active' | 'inactive'
export type TimeOffType = 'absence' | 'vacation'
export type RequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled'
export type ItTicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ItTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type CalendarEventType =
  | 'pd'
  | 'coaching'
  | 'intervention'
  | 'evaluation'
  | 'meeting'
  | 'deadline'
  | 'other'
export type CalendarEventSource =
  | 'pd'
  | 'coaching'
  | 'intervention'
  | 'evaluation'
  | 'custom'
export type PresenceStatus = 'online' | 'away' | 'offline'

export interface School {
  id: string
  name: string
  district: string
  enrollment: number
  created_at: string
}

export interface Goal {
  id: string
  school_id: string
  category: GoalCategory
  metric_name: string
  target_value: number
  current_value: number
  status: GoalStatus
  time_period: string
  created_at: string
  updated_at: string
}

export interface Intervention {
  id: string
  school_id: string
  date: string
  issue: string
  action_taken: string
  owner: string
  owner_id: string | null
  status: InterventionStatus
  resolution_notes: string | null
  resolution_evidence_url: string | null
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

export interface Profile {
  id: string
  name: string | null
  role: UserRole
  partner_id: string | null
  partner_user_type: PartnerUserType | null
  teaching_evaluation: TeachingEvaluation | null
  created_at: string
}

export interface PartnerUser extends Profile {
  partner_name: string | null
}

export interface TimeOffRequest {
  id: string
  user_id: string
  partner_id: string
  submitted_by: string
  type: TimeOffType
  start_date: string
  end_date: string
  reason: string
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
}

export interface TimeOffRequestWithDetails extends TimeOffRequest {
  employee_name: string | null
  submitter_name: string | null
  partner_name: string | null
  reviewer_name: string | null
}

export interface ItTicket {
  id: string
  user_id: string
  subject: string
  description: string
  priority: ItTicketPriority
  status: ItTicketStatus
  created_at: string
  updated_at: string
}

export interface GrowthPlan {
  id: string
  user_id: string
  school_id: string
  school_year: string
  status: GrowthPlanStatus
  created_at: string
  updated_at: string
}

export interface GrowthPlanGoal {
  id: string
  plan_id: string
  goal_text: string
  action_steps: string | null
  status: GoalItemStatus
  sort_order: number
  created_at: string
}

export interface GrowthPlanReflection {
  id: string
  plan_id: string
  content: string
  reflection_date: string
  created_at: string
}

export interface GrowthPlanEvidence {
  id: string
  plan_id: string
  title: string
  url: string | null
  notes: string | null
  created_at: string
}

export interface CoachingCycle {
  id: string
  coach_id: string
  teacher_id: string
  school_id: string
  focus_area: string
  status: CoachingCycleStatus
  start_date: string
  end_date: string | null
  check_in_frequency: CheckInFrequency
  frequency_source: FrequencySource
  support_level: CoachingSupportLevel
  next_check_in_at: string | null
  evaluation_cycle_id: string | null
  created_at: string
}

export interface CoachingCheckIn {
  id: string
  cycle_id: string
  scheduled_at: string
  status: CoachingCheckInStatus
  completed_at: string | null
  notes: string | null
  created_at: string
}

export interface WalkthroughData {
  student_engagement?: string
  classroom_management?: string
  differentiation?: string
  technology_integration?: string
}

export interface Observation {
  id: string
  cycle_id: string | null
  evaluation_cycle_id: string | null
  observer_id: string | null
  observation_type: ObservationType
  notes: string
  feedback: string
  ratings: Record<string, number>
  walkthrough_data: WalkthroughData
  observation_date: string
  created_at: string
}

export interface EvaluationFramework {
  id: string
  name: string
  slug: string
  is_system: boolean
  is_active: boolean
  created_at: string
}

export interface RubricDomain {
  id: string
  framework_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface RubricIndicator {
  id: string
  domain_id: string
  code: string
  description: string
  sort_order: number
  created_at: string
}

export interface EvaluationCycle {
  id: string
  teacher_id: string
  school_id: string
  evaluator_id: string
  framework_id: string
  cycle_type: EvaluationCycleType
  school_year: string
  status: EvaluationCycleStatus
  start_date: string
  end_date: string | null
  overall_rating: TeachingEvaluation | null
  created_at: string
  updated_at: string
}

export interface ObservationRubricScore {
  id: string
  observation_id: string
  indicator_id: string
  rating: RubricRating
  created_at: string
}

export interface EvaluationArtifact {
  id: string
  evaluation_cycle_id: string
  artifact_type: ArtifactType
  title: string
  file_url: string | null
  notes: string | null
  uploaded_by: string
  created_at: string
}

export interface CoachingLog {
  id: string
  cycle_id: string
  log_date: string
  content: string
  created_by: string
  created_at: string
}

export type PdEventFormat = 'in_person' | 'virtual' | 'hybrid'

export interface PdEvent {
  id: string
  title: string
  description: string | null
  credit_hours: number
  start_date: string
  end_date: string | null
  format: PdEventFormat | string
  location: string | null
  facilitator: string | null
  meeting_url: string | null
  meeting_id: string | null
  meeting_passcode: string | null
  materials_url: string | null
  join_instructions: string | null
  status: PdEventStatus
  created_at: string
}

export interface PdRegistration {
  id: string
  event_id: string
  user_id: string
  status: PdRegistrationStatus
  attended: boolean
  assigned_by: string | null
  created_at: string
}

export interface UserGroup {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
}

export interface Certification {
  id: string
  user_id: string
  certification_type: string
  issued_date: string
  expiry_date: string | null
  status: CertificationStatus
  school_id: string | null
  location: string | null
  notes: string | null
  renewal_issued_date: string | null
  renewal_expiry_date: string | null
  renewal_approval_status: CertificationRenewalStatus | null
  renewal_submitted_at: string | null
  renewal_approved_by: string | null
  renewal_approved_at: string | null
  created_at: string
}

export interface CertificationWithSchool extends Certification {
  school_name: string | null
  employee_name: string | null
}

export interface Partner {
  id: string
  name: string
  partner_type: PartnerType
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  services: string | null
  website: string | null
  status: PartnerStatus
  notes: string | null
  created_at: string
}

export interface PartnerWithSchools extends Partner {
  school_names: string[]
  school_count: number
}

export interface RevenueEntry {
  id: string
  description: string
  amount: number
  source: RevenueSource
  school_id: string | null
  revenue_date: string
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface RevenueEntryWithSchool extends RevenueEntry {
  school_name: string | null
}

export interface GoalWithSchool extends Goal {
  school_name: string
}

export interface InterventionWithSchool extends Intervention {
  school_name: string
}

export interface SchoolWithStats extends School {
  totalGoals: number
  onTrackCount: number
  onTrackPercent: number
  healthStatus: SchoolHealth
  openInterventions: number
}

export interface GrowthPlanWithDetails extends GrowthPlan {
  school_name: string
  user_name: string
  goal_count: number
}

export interface CoachingCycleWithDetails extends CoachingCycle {
  coach_name: string
  teacher_name: string
  school_name: string
  observation_count: number
}

export interface EvaluationCycleWithDetails extends EvaluationCycle {
  teacher_name: string
  evaluator_name: string
  school_name: string
  framework_name: string
  observation_count: number
}

export interface ObservationWithDetails extends Observation {
  observer_name: string | null
  rubric_scores: ObservationRubricScore[]
}

export interface EvaluationArtifactWithUploader extends EvaluationArtifact {
  uploader_name: string
}

export interface PdEventWithCount extends PdEvent {
  registration_count: number
}

export interface PdRegistrationWithEvent extends PdRegistration {
  event_title: string
  credit_hours: number
  start_date: string
  assigned_by_name?: string | null
}

export interface PdRegistrationWithUser extends PdRegistration {
  user_name: string
  user_role: UserRole
  assigned_by_name: string | null
}

export interface CalendarEventRecord {
  id: string
  title: string
  description: string | null
  event_type: CalendarEventType
  start_at: string
  end_at: string | null
  all_day: boolean
  location: string | null
  school_id: string | null
  created_by: string | null
  created_at: string
}

export interface CalendarEventItem {
  id: string
  title: string
  description?: string | null
  start_at: string
  end_at?: string | null
  event_type: CalendarEventType
  source: CalendarEventSource
  href?: string
  school_name?: string | null
  location?: string | null
}

export interface Conversation {
  id: string
  title: string | null
  is_group: boolean
  dm_key: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ConversationParticipant {
  conversation_id: string
  user_id: string
  joined_at: string
  last_read_at: string | null
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

export interface MessageWithSender extends Message {
  sender_name: string
}

export interface ConversationWithMeta extends Conversation {
  participant_names: string[]
  participant_ids: string[]
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

export interface UserPresence {
  user_id: string
  status: PresenceStatus
  available_to_chat: boolean
  last_seen_at: string
  updated_at: string
}

export interface MessagingDirectoryEntry {
  id: string
  name: string | null
  role: UserRole
  status: PresenceStatus
  available_to_chat: boolean
  last_seen_at: string | null
}

export interface UserPresenceWithProfile extends UserPresence {
  name: string | null
  role: UserRole
}
