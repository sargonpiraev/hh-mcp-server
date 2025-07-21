import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

dotenv.config()

export const envSchema = z.object({
  HH_API_TOKEN: z.string(),
})

export const mcpServer = new McpServer(
  {
    name: '@sargonpiraev/hh-mcp-server',
    version: '1.0.0',
  },
  {
    instructions: ``,
    capabilities: {
      tools: {},
      logging: {},
    },
  }
)

export const env = envSchema.parse(process.env)

export const apiClient: AxiosInstance = axios.create({
  baseURL: '',
  headers: {
    'Accept': 'application/json'
  },
  timeout: 30000
})

apiClient.interceptors.request.use((config) => {
  if (env.HH_API_TOKEN) {
    config.headers['Authorization'] = env.HH_API_TOKEN
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

function handleResult(data: unknown): CallToolResult {
  return {
    content: [{ 
      type: 'text', 
      text: JSON.stringify(data, null, 2) 
    }]
  }
}

function handleError(error: unknown): CallToolResult {
  console.error(error)
  
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message
    return { 
      isError: true, 
      content: [{ type: 'text', text: `API Error: ${message}` }] 
    } as CallToolResult
  }
  
  return { 
    isError: true, 
    content: [{ type: 'text', text: `Error: ${error}` }] 
  } as CallToolResult
}

// Register tools
mcpServer.tool(
  'confirm-phone-in-resume',
  `Verify phone with a code`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/resume_phone_confirm',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-manager-settings',
  `Manager preferences`,
  {
    employer_id: z.string(),
    manager_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, manager_id, ...queryParams } = args
      const url = `/employers/${employer_id}/managers/${manager_id}/settings`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-employer-manager-limits',
  `Daily limit of resume views for current manager`,
  {
    employer_id: z.string(),
    manager_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, manager_id, ...queryParams } = args
      const url = `/employers/${employer_id}/managers/${manager_id}/limits/resume`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-employer-addresses',
  `Directory of employer&#x27;s addresses`,
  {
    employer_id: z.string(),
    changed_after: z.string().optional(),
    manager_id: z.string().optional(),
    with_manager: z.string().optional(),
    per_page: z.string().optional(),
    page: z.string().optional(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/addresses`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-employer-managers',
  `Directory of employer&#x27;s managers`,
  {
    employer_id: z.string(),
    page: z.string().optional(),
    per_page: z.string().optional(),
    search_text: z.string().optional(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/managers`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-employer-manager',
  `Adding a manager`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...requestData } = args
      const url = `/employers/${employer_id}/managers`
      
      const response = await apiClient.request({
        method: 'POST',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-employer-manager-types',
  `Directory of manager types and privileges`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/manager_types`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-manager-accounts',
  `Manager&#x27;s work accounts`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/manager_accounts/mine',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-applicant-phone-info',
  `Get information about the applicant&#x27;s phone number`,
  {
    phone: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/resume_should_send_sms',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-address',
  `Get address by ID`,
  {
    employer_id: z.string(),
    address_id: z.string(),
    with_manager: z.string().optional(),
  },
  async (args) => {
    try {
      const { employer_id, address_id, ...queryParams } = args
      const url = `/employers/${employer_id}/addresses/${address_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'edit-employer-manager',
  `Editing a manager`,
  {
    employer_id: z.string(),
    manager_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, manager_id, ...requestData } = args
      const url = `/employers/${employer_id}/managers/${manager_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-employer-manager',
  `Getting information about a manager`,
  {
    employer_id: z.string(),
    manager_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, manager_id, ...queryParams } = args
      const url = `/employers/${employer_id}/managers/${manager_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-employer-manager',
  `Deleting a manager`,
  {
    employer_id: z.string(),
    manager_id: z.string(),
    successor_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, manager_id, ...queryParams } = args
      const url = `/employers/${employer_id}/managers/${manager_id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'send-code-for-verify-phone-in-resume',
  `Send verification code to the phone number on CV`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/resume_phone_generate_code',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'authorize',
  `Getting an access-token`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/oauth/token',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'invalidate-token',
  `Access token invalidation`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: '/oauth/token',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-current-user-info',
  `Info on current authorized user`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/me',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'edit-current-user-info',
  `Editing information on the authorized user`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/me',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-locales-for-resume',
  `The list of available resume locales`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/locales/resume',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-locales',
  `The list of available locales`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/locales',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-positions-suggestions',
  `Resume position suggestions`,
  {
    text: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/positions',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-educational-institutions-suggests',
  `Educational institution name suggestions`,
  {
    text: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/educational_institutions',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-area-leaves-suggests',
  `Suggestions for all regions that are leaves in the region tree`,
  {
    text: z.string(),
    area_id: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/area_leaves',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-skill-set-suggests',
  `Key skills suggestions`,
  {
    text: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/skill_set',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy-positions-suggests',
  `Vacancy position suggestions`,
  {
    text: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/vacancy_positions',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-professional-roles-suggests',
  `Professional role suggestions`,
  {
    text: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/professional_roles',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-search-keywords-suggests',
  `Suggestions for resume search key words`,
  {
    text: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/resume_search_keyword',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-areas-suggests',
  `Suggestions for all regions`,
  {
    text: z.string(),
    area_id: z.string().optional(),
    include_parent: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/areas',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy-search-keywords',
  `Suggestions for vacancy search key words`,
  {
    text: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/vacancy_search_keyword',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-fields-of-study-suggestions',
  `Specialization suggestions`,
  {
    text: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/fields_of_study',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-registered-companies-suggests',
  `Organization suggestions`,
  {
    text: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/suggests/companies',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'read-resume-profile',
  `Получение схемы резюме-профиля соискателя для резюме`,
  {
    resume_id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, ...queryParams } = args
      const url = `/resume_profile/${resume_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-resume-profile',
  `Обновление резюме-профиля соискателя`,
  {
    resume_id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, ...requestData } = args
      const url = `/resume_profile/${resume_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-resume-profile',
  `Создание резюме-профиля соискателя`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/resume_profile',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-profile-dictionaries',
  `Получение cловарей резюме-профиля`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/resume_profile/dictionaries',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-payable-api-actions',
  `Information about active API services for payable methods`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/services/payable_api_actions/active`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-payable-api-method-access',
  `Checking access to the paid methods`,
  {
    employer_id: z.string(),
    manager_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, manager_id, ...queryParams } = args
      const url = `/employers/${employer_id}/managers/${manager_id}/method_access`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-saved-vacancy-searches',
  `List of saved vacancy searches`,
  {
    page: z.string().optional(),
    per_page: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/saved_searches/vacancies',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-saved-vacancy-search',
  `Creating new saved vacancy search`,
  {
    page: z.string().optional(),
    per_page: z.string().optional(),
    text: z.string().optional(),
    name: z.string().optional(),
    search_field: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professional_role: z.string().optional(),
    industry: z.string().optional(),
    employer_id: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    only_with_salary: z.string().optional(),
    period: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    top_lat: z.string().optional(),
    bottom_lat: z.string().optional(),
    left_lng: z.string().optional(),
    right_lng: z.string().optional(),
    order_by: z.string().optional(),
    sort_point_lat: z.string().optional(),
    sort_point_lng: z.string().optional(),
    clusters: z.string().optional(),
    describe_arguments: z.string().optional(),
    no_magic: z.string().optional(),
    premium: z.string().optional(),
    responses_count_enabled: z.string().optional(),
    part_time: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/saved_searches/vacancies',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy-visitors',
  `Vacancy visitors`,
  {
    vacancy_id: z.string(),
    page: z.string().optional(),
    per_page: z.string().optional(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/${vacancy_id}/visitors`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy',
  `View a vacancy`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/${vacancy_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'edit-vacancy',
  `Editing vacancies`,
  {
    vacancy_id: z.string(),
    ignore_duplicates: z.string().optional(),
    ignore_replacement_warning: z.string().optional(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...requestData } = args
      const url = `/vacancies/${vacancy_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-blacklisted-vacancies',
  `List of hidden vacancies`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/vacancies/blacklisted',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'publish-vacancy',
  `Publishing job vacancies`,
  {
    ignore_duplicates: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/vacancies',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancies',
  `Search for vacancies`,
  {
    page: z.string().optional(),
    per_page: z.string().optional(),
    text: z.string().optional(),
    search_field: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professional_role: z.string().optional(),
    industry: z.string().optional(),
    employer_id: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    only_with_salary: z.string().optional(),
    period: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    top_lat: z.string().optional(),
    bottom_lat: z.string().optional(),
    left_lng: z.string().optional(),
    right_lng: z.string().optional(),
    order_by: z.string().optional(),
    sort_point_lat: z.string().optional(),
    sort_point_lng: z.string().optional(),
    clusters: z.string().optional(),
    describe_arguments: z.string().optional(),
    no_magic: z.string().optional(),
    premium: z.string().optional(),
    responses_count_enabled: z.string().optional(),
    part_time: z.string().optional(),
    accept_temporary: z.string().optional(),
    employment_form: z.string().optional(),
    work_schedule_by_days: z.string().optional(),
    working_hours: z.string().optional(),
    work_format: z.string().optional(),
    excluded_text: z.string().optional(),
    education: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/vacancies',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancies-related-to-vacancy',
  `Search for vacancies related to a vacancy`,
  {
    vacancy_id: z.string(),
    page: z.string().optional(),
    per_page: z.string().optional(),
    text: z.string().optional(),
    search_field: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professional_role: z.string().optional(),
    industry: z.string().optional(),
    employer_id: z.string().optional(),
    excluded_employer_id: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    only_with_salary: z.string().optional(),
    period: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    top_lat: z.string().optional(),
    bottom_lat: z.string().optional(),
    left_lng: z.string().optional(),
    right_lng: z.string().optional(),
    order_by: z.string().optional(),
    sort_point_lat: z.string().optional(),
    sort_point_lng: z.string().optional(),
    clusters: z.string().optional(),
    describe_arguments: z.string().optional(),
    no_magic: z.string().optional(),
    premium: z.string().optional(),
    responses_count_enabled: z.string().optional(),
    part_time: z.string().optional(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/${vacancy_id}/related_vacancies`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-saved-vacancy-search',
  `Obtaining single saved vacancy search`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...queryParams } = args
      const url = `/saved_searches/vacancies/${id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-saved-vacancy-search',
  `Updating saved vacancy search`,
  {
    id: z.string(),
    name: z.string().optional(),
    subscription: z.string().optional(),
  },
  async (args) => {
    try {
      const { id, ...requestData } = args
      const url = `/saved_searches/vacancies/${id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-saved-vacancy-search',
  `Deleting saved vacancy search`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...queryParams } = args
      const url = `/saved_searches/vacancies/${id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancies-similar-to-vacancy',
  `Search for vacancies similar to a vacancy`,
  {
    vacancy_id: z.string(),
    page: z.string().optional(),
    per_page: z.string().optional(),
    text: z.string().optional(),
    search_field: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professional_role: z.string().optional(),
    industry: z.string().optional(),
    employer_id: z.string().optional(),
    excluded_employer_id: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    only_with_salary: z.string().optional(),
    period: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    top_lat: z.string().optional(),
    bottom_lat: z.string().optional(),
    left_lng: z.string().optional(),
    right_lng: z.string().optional(),
    order_by: z.string().optional(),
    sort_point_lat: z.string().optional(),
    sort_point_lng: z.string().optional(),
    clusters: z.string().optional(),
    describe_arguments: z.string().optional(),
    no_magic: z.string().optional(),
    premium: z.string().optional(),
    responses_count_enabled: z.string().optional(),
    part_time: z.string().optional(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/${vacancy_id}/similar_vacancies`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy-upgrade-list',
  `List of vacancy upgrades`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/${vacancy_id}/upgrades`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancies-similar-to-resume',
  `Search for vacancies similar to a resume`,
  {
    resume_id: z.string(),
    page: z.string().optional(),
    per_page: z.string().optional(),
    text: z.string().optional(),
    search_field: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professional_role: z.string().optional(),
    industry: z.string().optional(),
    employer_id: z.string().optional(),
    excluded_employer_id: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    only_with_salary: z.string().optional(),
    period: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    top_lat: z.string().optional(),
    bottom_lat: z.string().optional(),
    left_lng: z.string().optional(),
    right_lng: z.string().optional(),
    order_by: z.string().optional(),
    sort_point_lat: z.string().optional(),
    sort_point_lng: z.string().optional(),
    clusters: z.string().optional(),
    describe_arguments: z.string().optional(),
    no_magic: z.string().optional(),
    premium: z.string().optional(),
    responses_count_enabled: z.string().optional(),
    part_time: z.string().optional(),
  },
  async (args) => {
    try {
      const { resume_id, ...queryParams } = args
      const url = `/resumes/${resume_id}/similar_vacancies`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-favorite-vacancies',
  `List of favorited vacancies`,
  {
    page: z.string().optional(),
    per_page: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/vacancies/favorited',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-vacancy-to-blacklisted',
  `Adding a vacancy in the blacklist`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...requestData } = args
      const url = `/vacancies/blacklisted/${vacancy_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-vacancy-from-blacklisted',
  `Deleting a vacancy from the blacklist`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/blacklisted/${vacancy_id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-active-vacancy-list',
  `View a published vacancy list`,
  {
    employer_id: z.string(),
    page: z.string().optional(),
    per_page: z.string().optional(),
    manager_id: z.string().optional(),
    text: z.string().optional(),
    area: z.string().optional(),
    resume_id: z.string().optional(),
    order_by: z.string().optional(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/vacancies/active`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-hidden-vacancies',
  `Deleted vacancy list`,
  {
    employer_id: z.string(),
    manager_id: z.string().optional(),
    order_by: z.string().optional(),
    per_page: z.string().optional(),
    page: z.string().optional(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/vacancies/hidden`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-vacancy-to-hidden',
  `Deleting vacancies`,
  {
    employer_id: z.string(),
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, vacancy_id, ...requestData } = args
      const url = `/employers/${employer_id}/vacancies/hidden/${vacancy_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'restore-vacancy-from-hidden',
  `Restoring deleted vacancies`,
  {
    employer_id: z.string(),
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, vacancy_id, ...queryParams } = args
      const url = `/employers/${employer_id}/vacancies/hidden/${vacancy_id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy-conditions',
  `Conditions for filling out fields when publishing and editing vacancies`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/vacancy_conditions',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-prolongation-vacancy-info',
  `Information about vacancy prolongation possibility`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/${vacancy_id}/prolongate`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'vacancy-prolongation',
  `Vacancy prolongation`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...requestData } = args
      const url = `/vacancies/${vacancy_id}/prolongate`
      
      const response = await apiClient.request({
        method: 'POST',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-vacancy-to-archive',
  `Archiving vacancies`,
  {
    employer_id: z.string(),
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, vacancy_id, ...requestData } = args
      const url = `/employers/${employer_id}/vacancies/archived/${vacancy_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-pref-negotiations-order',
  `Viewing preferred options for sorting responses`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...queryParams } = args
      const url = `/vacancies/${id}/preferred_negotiations_order`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'put-pref-negotiations-order',
  `Changing preferred options for sorting responses`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...requestData } = args
      const url = `/vacancies/${id}/preferred_negotiations_order`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-vacancy-to-favorite',
  `Add a vacancy in favorited`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...requestData } = args
      const url = `/vacancies/favorited/${vacancy_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-vacancy-from-favorite',
  `Delete a vacancy from favorited`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/favorited/${vacancy_id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-available-vacancy-types',
  `Possible options available to current manager for publishing of vacancies`,
  {
    employer_id: z.string(),
    manager_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, manager_id, ...queryParams } = args
      const url = `/employers/${employer_id}/managers/${manager_id}/vacancies/available_types`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy-stats',
  `Vacancy statistics`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/${vacancy_id}/stats`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-archived-vacancies',
  `Archived vacancy list`,
  {
    employer_id: z.string(),
    manager_id: z.string().optional(),
    order_by: z.string().optional(),
    per_page: z.string().optional(),
    page: z.string().optional(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/vacancies/archived`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-artifacts-portfolio-conditions',
  `Conditions for uploading portfolio`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/artifacts/portfolio/conditions',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'edit-artifact',
  `Editing an artifact`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...requestData } = args
      const url = `/artifacts/${id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-artifact',
  `Deleting an artifact`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...queryParams } = args
      const url = `/artifacts/${id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'load-artifact',
  `Uploading an artifact`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/artifacts',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-artifacts-portfolio',
  `Getting portfolios`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/artifacts/portfolio',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-artifact-photos-conditions',
  `Conditions for uploading photos`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/artifacts/photo/conditions',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-artifact-photos',
  `Getting photos`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/artifacts/photo',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-dictionaries',
  `Directories of fields`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/dictionaries',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-languages',
  `The list of all languages`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/languages',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-educational-institutions-dictionary',
  `Basic information about educational institutions`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/educational_institutions',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-skills',
  `The list of key skills`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/skills',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-professional-roles-dictionary',
  `Professional role directory`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/professional_roles',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-faculties',
  `List of educational institution faculties`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...queryParams } = args
      const url = `/educational_institutions/${id}/faculties`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-industries',
  `Industries`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/industries',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'change-negotiation-action',
  `Actions with collection response/invitation`,
  {
    collection_name: z.string(),
    nid: z.string(),
  },
  async (args) => {
    try {
      const { collection_name, nid, ...requestData } = args
      const url = `/negotiations/${collection_name}/${nid}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'apply-to-vacancy',
  `Apply for a vacancy`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/negotiations',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-negotiations',
  `Negotiation list`,
  {
    page: z.string().optional(),
    per_page: z.string().optional(),
    order_by: z.string().optional(),
    order: z.string().optional(),
    vacancy_id: z.string().optional(),
    status: z.string().optional(),
    has_updates: z.string().optional(),
    with_job_search_status: z.string().optional(),
    with_generated_collections: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/negotiations',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-negotiations-statistics-manager',
  `Negotiation statistics for the manager`,
  {
    employer_id: z.string(),
    manager_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, manager_id, ...queryParams } = args
      const url = `/employers/${employer_id}/managers/${manager_id}/negotiations_statistics`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-active-negotiations',
  `Active negotiation list`,
  {
    page: z.string().optional(),
    per_page: z.string().optional(),
    order_by: z.string().optional(),
    order: z.string().optional(),
    vacancy_id: z.string().optional(),
    has_updates: z.string().optional(),
    with_job_search_status: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/negotiations/active',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-negotiation-message-templates',
  `Template list for the negotiation`,
  {
    template: z.string(),
    topic_id: z.string().optional(),
    vacancy_id: z.string().optional(),
    resume_id: z.string().optional(),
  },
  async (args) => {
    try {
      const { template, ...queryParams } = args
      const url = `/message_templates/${template}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-collection-negotiations-list',
  `Negotiation list of the collection`,
  {
    vacancy_id: z.string(),
    order_by: z.string().optional(),
    page: z.string().optional(),
    per_page: z.string().optional(),
    age_from: z.string().optional(),
    age_to: z.string().optional(),
    area: z.string().optional(),
    citizenship: z.string().optional(),
    currency: z.string().optional(),
    driver_license_types: z.string().optional(),
    educational_institution: z.string().optional(),
    education_level: z.string().optional(),
    experience: z.string().optional(),
    gender: z.string().optional(),
    language: z.string().optional(),
    relocation: z.string().optional(),
    salary_from: z.string().optional(),
    salary_to: z.string().optional(),
    search_radius_meters: z.string().optional(),
    search_text: z.string().optional(),
    show_only_new_responses: z.string().optional(),
    show_only_with_vehicle: z.string().optional(),
    show_only_new: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/negotiations/response',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'invite-applicant-to-vacancy',
  `Invite applicant for a vacancy`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/negotiations/phone_interview',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-negotiation-test-results',
  `Get test results attached to the vacancy`,
  {
    nid: z.string(),
  },
  async (args) => {
    try {
      const { nid, ...queryParams } = args
      const url = `/negotiations/${nid}/test/solution`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'edit-negotiation-message',
  `Edit messages in the response`,
  {
    nid: z.string(),
    mid: z.string(),
  },
  async (args) => {
    try {
      const { nid, mid, ...requestData } = args
      const url = `/negotiations/${nid}/messages/${mid}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'post-negotiations-topics-read',
  `Mark responses as read`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/negotiations/read',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'hide-active-response',
  `Hide response`,
  {
    nid: z.string(),
    with_decline_message: z.string().optional(),
  },
  async (args) => {
    try {
      const { nid, ...queryParams } = args
      const url = `/negotiations/active/${nid}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-negotiation-item',
  `Viewing the response/invitation`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...queryParams } = args
      const url = `/negotiations/${id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'put-negotiations-collection-to-next-state',
  `Actions with responses/invitations`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...requestData } = args
      const url = `/negotiations/${id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-negotiations-statistics-employer',
  `Negotiation statistics for the company`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/negotiations_statistics`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'send-negotiation-message',
  `Sending new message`,
  {
    nid: z.string(),
  },
  async (args) => {
    try {
      const { nid, ...requestData } = args
      const url = `/negotiations/${nid}/messages`
      
      const response = await apiClient.request({
        method: 'POST',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-negotiation-messages',
  `View the list of messages in the negotiation`,
  {
    nid: z.string(),
    with_text_only: z.string().optional(),
  },
  async (args) => {
    try {
      const { nid, ...queryParams } = args
      const url = `/negotiations/${nid}/messages`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy-draft',
  `Obtaining a vacancy draft`,
  {
    draft_id: z.string(),
  },
  async (args) => {
    try {
      const { draft_id, ...queryParams } = args
      const url = `/vacancies/drafts/${draft_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'change-vacancy-draft',
  `Editing a vacancy draft`,
  {
    draft_id: z.string(),
  },
  async (args) => {
    try {
      const { draft_id, ...requestData } = args
      const url = `/vacancies/drafts/${draft_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-vacancy-draft',
  `Deleting a vacancy draft`,
  {
    draft_id: z.string(),
  },
  async (args) => {
    try {
      const { draft_id, ...queryParams } = args
      const url = `/vacancies/drafts/${draft_id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'publish-vacancy-from-draft',
  `Publishing a vacancy from draft`,
  {
    draft_id: z.string(),
  },
  async (args) => {
    try {
      const { draft_id, ...requestData } = args
      const url = `/vacancies/drafts/${draft_id}/publish`
      
      const response = await apiClient.request({
        method: 'POST',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'search-for-vacancy-draft-duplicates',
  `Checking for duplicates of a vacancy draft`,
  {
    draft_id: z.string(),
  },
  async (args) => {
    try {
      const { draft_id, ...queryParams } = args
      const url = `/vacancies/drafts/${draft_id}/duplicates`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-vacancy-draft',
  `Creating vacancy draft`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/vacancies/drafts',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy-draft-list',
  `Getting a list of vacancy drafts`,
  {
    page: z.string().optional(),
    per_page: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/vacancies/drafts',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'disable-automatic-vacancy-publication',
  `Canceling vacancy auto publication`,
  {
    draft_id: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: '/vacancies/auto_publication',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'change-webhook-subscription',
  `Change a subscription on notifications`,
  {
    subscription_id: z.string(),
  },
  async (args) => {
    try {
      const { subscription_id, ...requestData } = args
      const url = `/webhook/subscriptions/${subscription_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'cancel-webhook-subscription',
  `Delete a subscription on notifications`,
  {
    subscription_id: z.string(),
  },
  async (args) => {
    try {
      const { subscription_id, ...queryParams } = args
      const url = `/webhook/subscriptions/${subscription_id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'post-webhook-subscription',
  `Subscription to notifications`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/webhook/subscriptions',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-webhook-subscriptions',
  `Obtain the list of notifications that the user is subscripted`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/webhook/subscriptions',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-tests-dictionary',
  `Employer&#x27;s test directory`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/tests`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-employer-vacancy-areas',
  `List of regions with active vacancies`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/vacancy_areas/active`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-employer-info',
  `Employer info`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-employer-to-blacklisted',
  `Adding an employer to the blacklist`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...requestData } = args
      const url = `/employers/blacklisted/${employer_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-employer-from-blacklisted',
  `Deleting an employer from the blacklist`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/blacklisted/${employer_id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'search-employer',
  `Employer search`,
  {
    text: z.string().optional(),
    area: z.string().optional(),
    type: z.string().optional(),
    only_with_vacancies: z.string().optional(),
    sort_by: z.string().optional(),
    page: z.string().optional(),
    per_page: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/employers',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-employer-departments',
  `Employer&#x27;s department directory`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/departments`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy-branded-templates-list',
  `Employer&#x27;s branded vacancy templates`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/vacancy_branded_templates`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-blacklisted-employers',
  `List of hidden employers`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/employers/blacklisted',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-all-districts',
  `List of available city districts`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/districts',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-salary-evaluation',
  `Salary assessment without forecasts`,
  {
    area_id: z.string(),
    exclude_area: z.string().optional(),
    employee_level: z.string().optional(),
    industry: z.string().optional(),
    speciality: z.string().optional(),
    extend_sources: z.string().optional(),
    position_name: z.string().optional(),
  },
  async (args) => {
    try {
      const { area_id, ...queryParams } = args
      const url = `/salary_statistics/paid/salary_evaluation/${area_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-metro-stations',
  `The list of metro stations in all cities`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/metro',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-metro-stations-in-city',
  `The list of metro stations in the specified city`,
  {
    city_id: z.string(),
  },
  async (args) => {
    try {
      const { city_id, ...queryParams } = args
      const url = `/metro/${city_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'move-saved-resume-search',
  `Moving saved resumes search to other manager`,
  {
    saved_search_id: z.string(),
    manager_id: z.string(),
  },
  async (args) => {
    try {
      const { saved_search_id, manager_id, ...requestData } = args
      const url = `/saved_searches/resumes/${saved_search_id}/managers/${manager_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resumes-by-status',
  `Resumes grouped by the possibility of application for a given job`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/${vacancy_id}/resumes_by_status`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-status',
  `Resume status and readiness for publication`,
  {
    resume_id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, ...queryParams } = args
      const url = `/resumes/${resume_id}/status`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-negotiations-history',
  `History of responses/invitations for a resume`,
  {
    resume_id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, ...queryParams } = args
      const url = `/resumes/${resume_id}/negotiations_history`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-saved-resume-search',
  `Getting single saved resume search`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...queryParams } = args
      const url = `/saved_searches/resumes/${id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-saved-resume-search',
  `Updating saved resume search`,
  {
    id: z.string(),
    name: z.string().optional(),
    subscription: z.string().optional(),
  },
  async (args) => {
    try {
      const { id, ...requestData } = args
      const url = `/saved_searches/resumes/${id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-saved-resume-search',
  `Deleting saved resume search`,
  {
    id: z.string(),
  },
  async (args) => {
    try {
      const { id, ...queryParams } = args
      const url = `/saved_searches/resumes/${id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-resume',
  `Resume creating`,
  {
    source_resume_id: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/resumes',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'search-for-resumes',
  `Resume search`,
  {
    text: z.string().optional(),
    text.logic: z.string().optional(),
    text.field: z.string().optional(),
    text.period: z.string().optional(),
    text.company_size: z.string().optional(),
    text.industry: z.string().optional(),
    age_from: z.string().optional(),
    age_to: z.string().optional(),
    area: z.string().optional(),
    relocation: z.string().optional(),
    period: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    education_level: z.string().optional(),
    employment: z.string().optional(),
    experience: z.string().optional(),
    skill: z.string().optional(),
    gender: z.string().optional(),
    label: z.string().optional(),
    language: z.string().optional(),
    metro: z.string().optional(),
    currency: z.string().optional(),
    salary_from: z.string().optional(),
    salary_to: z.string().optional(),
    schedule: z.string().optional(),
    order_by: z.string().optional(),
    citizenship: z.string().optional(),
    work_ticket: z.string().optional(),
    educational_institution: z.string().optional(),
    search_in_responses: z.string().optional(),
    by_text_prefix: z.string().optional(),
    driver_license_types: z.string().optional(),
    vacancy_id: z.string().optional(),
    page: z.string().optional(),
    per_page: z.string().optional(),
    professional_role: z.string().optional(),
    folder: z.string().optional(),
    include_all_folders: z.string().optional(),
    job_search_status: z.string().optional(),
    resume: z.string().optional(),
    filter_exp_industry: z.string().optional(),
    filter_exp_period: z.string().optional(),
    with_job_search_status: z.string().optional(),
    education_levels: z.string().optional(),
    district: z.string().optional(),
    saved_search_id: z.string().optional(),
    search_by_vacancy_id: z.string().optional(),
    last_used_timestamp: z.string().optional(),
    last_used: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/resumes',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-mine-resumes',
  `List of resumes for current user`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/resumes/mine',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'publish-resume',
  `Resume publication`,
  {
    resume_id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, ...requestData } = args
      const url = `/resumes/${resume_id}/publish`
      
      const response = await apiClient.request({
        method: 'POST',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-new-resume-conditions',
  `Conditions to fill in the fields of a new resume`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/resume_conditions',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-suitable-resumes',
  `List of resumes suitable for job application`,
  {
    vacancy_id: z.string(),
  },
  async (args) => {
    try {
      const { vacancy_id, ...queryParams } = args
      const url = `/vacancies/${vacancy_id}/suitable_resumes`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-conditions',
  `Conditions to fill in the fields of an existent resume`,
  {
    resume_id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, ...queryParams } = args
      const url = `/resumes/${resume_id}/conditions`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-view-history',
  `History of resume views`,
  {
    resume_id: z.string(),
    with_employer_logo: z.string().optional(),
  },
  async (args) => {
    try {
      const { resume_id, ...queryParams } = args
      const url = `/resumes/${resume_id}/views`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume',
  `View a resume`,
  {
    resume_id: z.string(),
    with_negotiations_history: z.string().optional(),
    with_creds: z.string().optional(),
    with_job_search_status: z.string().optional(),
  },
  async (args) => {
    try {
      const { resume_id, ...queryParams } = args
      const url = `/resumes/${resume_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-resume',
  `Deleting a resume`,
  {
    resume_id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, ...queryParams } = args
      const url = `/resumes/${resume_id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'edit-resume',
  `Resume updating`,
  {
    resume_id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, ...requestData } = args
      const url = `/resumes/${resume_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-creation-availability',
  `Availability of resume creation`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/resumes/creation_availability',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-saved-resume-searches',
  `List of Saved resume searches`,
  {
    page: z.string().optional(),
    per_page: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/saved_searches/resumes',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-saved-resume-search',
  `Creating new saved resumes search`,
  {
    text: z.string().optional(),
    text.logic: z.string().optional(),
    text.field: z.string().optional(),
    text.period: z.string().optional(),
    age_from: z.string().optional(),
    age_to: z.string().optional(),
    area: z.string().optional(),
    relocation: z.string().optional(),
    period: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    education_level: z.string().optional(),
    employment: z.string().optional(),
    experience: z.string().optional(),
    skill: z.string().optional(),
    gender: z.string().optional(),
    label: z.string().optional(),
    language: z.string().optional(),
    metro: z.string().optional(),
    currency: z.string().optional(),
    salary_from: z.string().optional(),
    salary_to: z.string().optional(),
    schedule: z.string().optional(),
    order_by: z.string().optional(),
    citizenship: z.string().optional(),
    work_ticket: z.string().optional(),
    educational_institution: z.string().optional(),
    search_in_responses: z.string().optional(),
    by_text_prefix: z.string().optional(),
    driver_license_types: z.string().optional(),
    vacancy_id: z.string().optional(),
    page: z.string().optional(),
    per_page: z.string().optional(),
    professional_role: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/saved_searches/resumes',
        data: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-access-types',
  `Retrieving a list of resume visibility types`,
  {
    resume_id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, ...queryParams } = args
      const url = `/resumes/${resume_id}/access_types`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-applicant-comment',
  `Update a comment`,
  {
    applicant_id: z.string(),
    comment_id: z.string(),
  },
  async (args) => {
    try {
      const { applicant_id, comment_id, ...requestData } = args
      const url = `/applicant_comments/${applicant_id}/${comment_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-applicant-comment',
  `Delete a comment`,
  {
    applicant_id: z.string(),
    comment_id: z.string(),
  },
  async (args) => {
    try {
      const { applicant_id, comment_id, ...queryParams } = args
      const url = `/applicant_comments/${applicant_id}/${comment_id}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-applicant-comments-list',
  `List of comments`,
  {
    applicant_id: z.string(),
    page: z.string().optional(),
    per_page: z.string().optional(),
    order_by: z.string().optional(),
  },
  async (args) => {
    try {
      const { applicant_id, ...queryParams } = args
      const url = `/applicant_comments/${applicant_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-applicant-comment',
  `Add a comment`,
  {
    applicant_id: z.string(),
  },
  async (args) => {
    try {
      const { applicant_id, ...requestData } = args
      const url = `/applicant_comments/${applicant_id}`
      
      const response = await apiClient.request({
        method: 'POST',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'put-mail-templates-item',
  `Edit a template for response to an applicant`,
  {
    employer_id: z.string(),
    template_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, template_id, ...requestData } = args
      const url = `/employers/${employer_id}/mail_templates/${template_id}`
      
      const response = await apiClient.request({
        method: 'PUT',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-mail-templates',
  `List of available templates for response to an applicant`,
  {
    employer_id: z.string(),
  },
  async (args) => {
    try {
      const { employer_id, ...queryParams } = args
      const url = `/employers/${employer_id}/mail_templates`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-clickme-statistics',
  `Getting info about Clickme ad campaign statistics`,
  {
    date_from: z.string(),
    date_to: z.string(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/clickme/statistics',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-countries',
  `Countries`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/areas/countries',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-areas',
  `Tree view of all regions`,
  {
    additional_case: z.string().optional(),
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/areas',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-areas-from-specified',
  `Region directory, starting from the specified region`,
  {
    area_id: z.string(),
    additional_case: z.string().optional(),
  },
  async (args) => {
    try {
      const { area_id, ...queryParams } = args
      const url = `/areas/${area_id}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-salary-employee-levels',
  `Competency levels`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/salary_statistics/dictionaries/employee_levels',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-salary-salary-areas',
  `Regions and cities`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/salary_statistics/dictionaries/salary_areas',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-salary-professional-areas',
  `Professions and specializations`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/salary_statistics/dictionaries/professional_areas',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-salary-industries',
  `Industries and fields of expertise`,
  {
  },
  async (args) => {
    try {
      
      const response = await apiClient.request({
        method: 'GET',
        url: '/salary_statistics/dictionaries/salary_industries',
        params: args
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-visibility-employers-list',
  `Searching for employers to add to the visibility list`,
  {
    resume_id: z.string(),
    list_type: z.string(),
    text: z.string(),
    per_page: z.string().optional(),
    page: z.string().optional(),
  },
  async (args) => {
    try {
      const { resume_id, list_type, ...queryParams } = args
      const url = `/resumes/${resume_id}/${list_type}/search`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume-visibility-list',
  `Getting visibility lists`,
  {
    resume_id: z.string(),
    list_type: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, list_type, ...queryParams } = args
      const url = `/resumes/${resume_id}/${list_type}`
      
      const response = await apiClient.request({
        method: 'GET',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-resume-visibility-list',
  `Adding employers to the visibility list`,
  {
    resume_id: z.string(),
    list_type: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, list_type, ...requestData } = args
      const url = `/resumes/${resume_id}/${list_type}`
      
      const response = await apiClient.request({
        method: 'POST',
        url: url,
        data: requestData
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-resume-visibility-list',
  `Clearing the visibility list`,
  {
    resume_id: z.string(),
    list_type: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, list_type, ...queryParams } = args
      const url = `/resumes/${resume_id}/${list_type}`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-employer-from-resume-visibility-list',
  `Removing employers from the visibility list`,
  {
    resume_id: z.string(),
    list_type: z.string(),
    id: z.string(),
  },
  async (args) => {
    try {
      const { resume_id, list_type, ...queryParams } = args
      const url = `/resumes/${resume_id}/${list_type}/employer`
      
      const response = await apiClient.request({
        method: 'DELETE',
        url: url,
        params: queryParams
      })
      
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

