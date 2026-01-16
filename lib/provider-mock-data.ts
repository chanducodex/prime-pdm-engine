import type { Provider, FilterConfig, FieldConfig } from "./provider-types"

export const mockProviderData: Provider[] = [
  {
    provider_Id: 198450,
    npi: 1013941673,
    firstName: "David",
    lastName: "Weiner",
    middleName: "Martin",
    providerType: "Specialist",
    groupEntity: "Trustees of Columbia University in the City of New York",
    basicInfo: {
      affiliation_status: "CD",
      cumc_division: "Urology",
      initial_appr_date: "10/10/2014",
      degree_description: "MD - Doctor of Medicine",
      cred_approval_status: "APPROVED",
      prior_appr_date: "2/2/2021",
      current_appr_date: "12/22/2023",
      date_hire: "11/3/2014",
      dateOfBirth: "",
      current_exp_date: "12/21/2026",
      fellow_y_n: "N",
      genderTypeId: 1,
      caqhId: 0,
      degree: "MD",
      cumc_department: "Urology",
      uni: "DW166",
      id: 161253,
    },
    medicare: [
      {
        medicareType: "Physician",
        medicarePtan: "202688",
        effectiveDate: "04/12/1996",
        terminationDate: "03/31/2027",
        id: 219512,
        medicareStateId: 33,
      },
    ],
    license: {
      DEA: [
        {
          licenseExpiryDate: "05/31/2027",
          licenseNumber: "BW6728806",
          id: 292415,
          category: 3,
        },
      ],
      CDS: [
        {
          licenseExpiryDate: "10/31/2026",
          licenseNumber: "D12176900",
          id: 292417,
          category: 2,
        },
      ],
    },
    specialties: [
      {
        name: "Urology",
        board_status: "Certified",
        certificateIssuerName: "American Board of Urology",
        issueDate: "02/28/2011",
        expiryDate: "02/28/2032",
        not_cert_reason: null,
        antic_exam_date: null,
        ispracticing: null,
        master_id: 464,
        id: 446461,
        specialtyName: "Urology",
      },
    ],
    affiliations: [
      {
        affiliationName: "NewYork-Presbyterian / Columbia",
        startDate: "07/01/1996",
        endDate: "04/30/2027",
        code: "131026",
        category: "Appointed",
        id: 140589,
      },
    ],
    malpractice: [
      {
        insurance_carrier: "MCIC Vermont Insurance, Inc.",
        insurance_policy_num: "PR1125",
        ins_Cov_From: "1/1/2025",
        ins_Cov_To: "12/31/2025",
        ins_Cov_Limit_From: "5,000,000",
        ins_Cov_Limit_To: "No Aggregate",
        ins_Cov_Type: "Claims Made",
      },
    ],
    educations: [
      {
        type: null,
        country: "USA",
        schoolName: "New Jersey College of Medicine & Dentistry (NJCMD)",
        degreeName: "Doctor of Medicine",
        degreeStartDate: "08/01/1990",
        degreeEndDate: "05/31/1994",
        status: null,
        id: 286166,
      },
    ],
    groupcollab: [],
    languages: [],
    billingAddress: [
      {
        addressLineFirst: "P.O. Box 27765",
        addressLineSecond: "P.O. Box 27765",
        city: "New York",
        stateId: 33,
        zipCode: "10087",
        county: "",
        pcp_panel: null,
        payerDirectory: null,
        wheelChairAccess: false,
        externalID: "1741",
        id: 209674,
      },
    ],
    address: [
      {
        addressLineFirst: "ColumbiaDoctors Department of Urology",
        addressLineSecond: "40 Saw Mill River Road, Suite UL-1",
        city: "Hawthorne",
        stateId: 33,
        zipCode: "10532",
        county: "Westchester",
        pcp_panel: "Not Applicable",
        payerDirectory: "Suppress from Directory",
        wheelChairAccess: true,
        externalID: "2841",
        id: 516980,
        fullAddress: "ColumbiaDoctors Department of Urology, 40 Saw Mill River Road, Suite UL-1",
        healthPlan: [
          {
            plan_par_status: "PAR",
            plan_action_date: "11/10/2014",
            startDate: "07/01/2022",
            endDate: "",
            plan_tier: "ID Confirmed",
            plan_assigned_id: "7877136",
            externalID: "21171658",
            plan_type_code: "ID INDIV",
            name: "Aetna",
            id: 1747673,
            master_id: 339,
          },
        ],
      },
    ],
  },
]

export const mockFilterConfig: FilterConfig[] = [
  {
    category: "HealthPlan",
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
          { id: 339, name: "Aetna" },
        ],
        filter_value: "",
      },
    ],
  },
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
          { id: 2, name: "Female" },
          { id: 3, name: "Other" },
          { id: 4, name: "Non-conforming" },
          { id: 5, name: "Non-Binary" },
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
        ],
        filter_value: "",
      },
    ],
  },
  {
    category: "Location Status",
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
]

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
