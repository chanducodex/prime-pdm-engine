export interface PayerExchangeData {
  health_plan_id: number
  health_plan_name: string
  health_plan_code: string
  health_plan_status: string
  health_plan_status_date: string
  health_plan_cycle_name: string
  health_plan_cycle_start_date: string
  time_elapsed: string | null
  cycle_errors_and_fixes_summary: string
  is_cycle_reschedule_allowed: boolean
  round_id: number
  health_plan_round_name: string
  health_plan_icon_color: string
  health_plan_image_url: string
  upload_id: number
  cycle_id: number
  total_provider: number
  file_type: number
  total_discrepancies: number
  fixed: number
  excel_url: string | null
  totalAddition: number
  totalChanges: number
  totalTermination: number
}

export interface PayerExchangeResponse {
  account_id: number
  health_plan_id: number
  cycle_id: number
  cycle_round_id: number
  is_successful: boolean
  errors: string[]
  response_data: PayerExchangeData[]
  user_message: string
}

export interface CycleHistoryData {
  id: number
  total_additon: number
  total_updates: number
  total_terminations: number
  cycle_start_date: string
  cycle_completion_date: string
  updatedOn: string
  time_elpased: string
  details: string
  addition_link: string
  update_link: string
  termination_link: string
  excel_url: string
  cycle_name: string
}

export interface CycleHistoryResponse {
  account_id: number
  health_plan_id: number
  cycle_id: number
  cycle_round_id: number
  is_successful: boolean
  errors: string[]
  response_data: CycleHistoryData[]
  user_message: string
}
