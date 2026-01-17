import type { Provider, FilterConfig, FieldConfig } from "./provider-types"

// API Response structure
export interface FilterAPIResponse {
  account_id: number
  health_plan_id: number
  cycle_id: number
  cycle_round_id: number
  is_successful: boolean
  errors: string[]
  response_data: {
    health_plans: FilterConfig
    filters: FilterConfig[]
    provider_views: unknown[]
  }
  user_message: string
}

// Mock API response matching the real API structure
export const mockFilterAPIResponse: FilterAPIResponse = {
  account_id: 11,
  health_plan_id: 0,
  cycle_id: 0,
  cycle_round_id: 0,
  is_successful: true,
  errors: [],
  response_data: {
    health_plans: {
      category: "HealthPlan",
      control_type: "dropdown",
      is_required: true,
      filter_columns: [
        {
          filter_key: "healthPlanId",
          filter_display_name: "HealthPlan",
          filter_data: [
            { id: 340, name: "Aetna Mcare" },
            { id: 341, name: "Affinity" },
            { id: 343, name: "Amidacare" },
            { id: 342, name: "Cigna" },
            { id: 348, name: "HealthFirst" },
            { id: 359, name: "Testing" },
            { id: 339, name: "Aetna" },
          ],
          filter_value: "",
        },
      ],
    },
    filters: [
      {
        category: "Specialty",
        filter_columns: [
          {
            filter_key: "splId",
            filter_display_name: "Specialty",
            filter_data: [
              { id: 420, name: "Infectious Disease" },
              { id: 422, name: "Surgery - Colon and Rectal Surgery" },
              { id: 423, name: "Surgery - General Surgery" },
              { id: 260, name: "Pain Medicine" },
              { id: 261, name: "Anesthesiology" },
              { id: 424, name: "Psychiatry - Child and Adolescent" },
              { id: 600, name: "Unknown - Other Specialty" },
            ],
            filter_value: "",
          },
        ],
      },
      {
        category: "Gender",
        filter_columns: [
          {
            filter_key: "genderTypeId",
            filter_display_name: "Gender",
            filter_data: [
              { id: 1, name: "Male" },
              { id: 2, name: "Female" },
              { id: 3, name: "Other" },
              { id: 4, name: "Non-conforming" },
              { id: 5, name: "Non-Binary" },
              { id: 6, name: "Transgender" },
              { id: 0, name: "Unknown" },
            ],
            filter_value: "",
          },
        ],
      },
      {
        category: "School Name",
        filter_columns: [
          {
            filter_key: "schoolName",
            filter_display_name: "School Name",
            filter_data: [
              { id: "Louisiana State University (LSU) School of Medicine", name: "Louisiana State University (LSU) School of Medicine" },
              { id: "Fordham University", name: "Fordham University" },
              { id: "Yale New Haven Hospital", name: "Yale New Haven Hospital" },
              { id: "Ashland University", name: "Ashland University" },
            ],
            filter_value: "",
          },
        ],
      },
      {
        category: "State",
        filter_columns: [
          {
            filter_key: "stateId",
            filter_display_name: "State",
            filter_data: [
              { id: 19, name: "Louisiana" },
              { id: 1, name: "Alabama" },
              { id: 2, name: "Alaska" },
              { id: 33, name: "New York" },
              { id: 5, name: "California" },
            ],
            filter_value: "",
          },
        ],
      },
      {
        category: "Location Status",
        control_type: "checkbox",
        filter_columns: [
          {
            filter_key: "locationStatus",
            filter_display_name: "Location Status",
            filter_data: [
              { id: "Active", name: "Active" },
              { id: "Inactive", name: "Inactive" },
            ],
            filter_value: "",
          },
        ],
      },
      {
        category: "Wheelchair Access",
        control_type: "checkbox",
        filter_columns: [
          {
            filter_key: "wheelChairAccess",
            filter_display_name: "Wheelchair Access",
            filter_data: [
              { id: "Yes", name: "Yes" },
              { id: "No", name: "No" },
            ],
            filter_value: "",
          },
        ],
      },
    ],
    provider_views: [],
  },
  user_message: "",
}

/**
 * Transform API response to filter config array
 */
export function transformFilterAPIResponse(apiResponse: FilterAPIResponse): FilterConfig[] {
  if (!apiResponse.is_successful || !apiResponse.response_data) {
    return []
  }

  const { health_plans, filters } = apiResponse.response_data
  
  // Combine health_plans with filters array
  return [health_plans, ...filters]
}

// Export transformed config for backward compatibility
export const mockFilterConfig: FilterConfig[] = transformFilterAPIResponse(mockFilterAPIResponse)

export const mockFieldConfig: FieldConfig[] = [
  {
    name: "npi",
    type: "text",
    label: "NPI Numbers",
    section: "provider",
    isHidden: false,
    required: true,
    placeholder: "Enter 10-digit NPI",
  },
  {
    name: "firstName",
    type: "text",
    label: "First Name",
    section: "provider",
    isHidden: false,
    required: true,
  },
  {
    name: "lastName",
    type: "text",
    label: "Last Name",
    section: "provider",
    isHidden: false,
    required: true,
  },
  {
    name: "middleName",
    type: "text",
    label: "MI",
    section: "provider",
    isHidden: false,
    required: false,
  },
  {
    name: "affiliation_status",
    type: "text",
    label: "Affiliation Status",
    section: "basicInfo",
    isHidden: false,
    required: true,
    placeholder: "Enter Affiliation Status",
  },
  {
    name: "cumc_division",
    type: "text",
    label: "Cumc Division",
    section: "basicInfo",
    isHidden: false,
    required: true,
    placeholder: "Enter Cumc Division",
  },
  {
    name: "degree_description",
    type: "text",
    label: "Degree Description",
    section: "basicInfo",
    isHidden: false,
    required: false,
    placeholder: "Enter Degree Description",
  },
  {
    name: "cred_approval_status",
    type: "text",
    label: "Approval Status",
    section: "basicInfo",
    isHidden: false,
    required: false,
    placeholder: "Enter Approval status",
  },
]



