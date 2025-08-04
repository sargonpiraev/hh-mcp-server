import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

dotenv.config()

export const envSchema = z.object({
  HH_CLIENT_ID: z.string(),
  HH_CLIENT_SECRET: z.string(),
  HH_USER_AGENT: z.string(),
  HH_REDIRECT_URI: z.string(),
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
  baseURL: 'https://api.hh.ru',
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config) => {
    if (env.HH_USER_AGENT) {
      config.headers['HH-User-Agent'] = env.HH_USER_AGENT
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

function handleResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  }
}

function handleError(error: unknown): CallToolResult {
  console.error(error)

  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message
    return {
      isError: true,
      content: [{ type: 'text', text: `API Error: ${message}` }],
    } as CallToolResult
  }

  return {
    isError: true,
    content: [{ type: 'text', text: `Error: ${error}` }],
  } as CallToolResult
}

// Register tools
mcpServer.tool('confirm-phone-in-resume', `Verify phone with a code`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = (args as any).requestData || { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'POST',
      url: '/resume_phone_confirm',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-manager-settings',
  `Manager preferences`,
  {
    employerId: z.string(),
    managerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, managerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers/${managerId}/settings`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    managerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, managerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers/${managerId}/limits/resume`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    changedAfter: z.string().optional(),
    managerId: z.string().optional(),
    withManager: z.string().optional(),
    perPage: z.string().optional(),
    page: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/addresses`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('changedAfter' in mappedParams) {
        mappedParams['changed_after'] = mappedParams['changedAfter']
        delete mappedParams['changedAfter']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }
      if ('withManager' in mappedParams) {
        mappedParams['with_manager'] = mappedParams['withManager']
        delete mappedParams['withManager']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    page: z.string().optional(),
    perPage: z.string().optional(),
    searchText: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('searchText' in mappedParams) {
        mappedParams['search_text'] = mappedParams['searchText']
        delete mappedParams['searchText']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/manager_types`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-manager-accounts', `Manager&#x27;s work accounts`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/manager_accounts/mine',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-applicant-phone-info',
  `Get information about the applicant&#x27;s phone number`,
  {
    phone: z.string(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/resume_should_send_sms',
        params: mappedParams,
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
    employerId: z.string(),
    addressId: z.string(),
    withManager: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { employerId, addressId, ...otherParams } = args
      const url = `/employers/${employerId}/addresses/${addressId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('addressId' in mappedParams) {
        mappedParams['address_id'] = mappedParams['addressId']
        delete mappedParams['addressId']
      }
      if ('withManager' in mappedParams) {
        mappedParams['with_manager'] = mappedParams['withManager']
        delete mappedParams['withManager']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    managerId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { employerId, managerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers/${managerId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    employerId: z.string(),
    managerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, managerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers/${managerId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    managerId: z.string(),
    successorId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, managerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers/${managerId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }
      if ('successorId' in mappedParams) {
        mappedParams['successor_id'] = mappedParams['successorId']
        delete mappedParams['successorId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
  {},
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/resume_phone_generate_code',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('authorize', `Getting an access-token`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = (args as any).requestData || { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'POST',
      url: '/oauth/token',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('invalidate-token', `Access token invalidation`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'DELETE',
      url: '/oauth/token',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-current-user-info', `Info on current authorized user`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/me',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('edit-current-user-info', `Editing information on the authorized user`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = (args as any).requestData || { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'POST',
      url: '/me',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-locales-for-resume', `The list of available resume locales`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/locales/resume',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-locales', `The list of available locales`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/locales',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-positions-suggestions',
  `Resume position suggestions`,
  {
    text: z.string(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/positions',
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/educational_institutions',
        params: mappedParams,
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
    areaId: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('areaId' in mappedParams) {
        mappedParams['area_id'] = mappedParams['areaId']
        delete mappedParams['areaId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/area_leaves',
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/skill_set',
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/vacancy_positions',
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/professional_roles',
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/resume_search_keyword',
        params: mappedParams,
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
    areaId: z.string().optional(),
    includeParent: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('areaId' in mappedParams) {
        mappedParams['area_id'] = mappedParams['areaId']
        delete mappedParams['areaId']
      }
      if ('includeParent' in mappedParams) {
        mappedParams['include_parent'] = mappedParams['includeParent']
        delete mappedParams['includeParent']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/areas',
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/vacancy_search_keyword',
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/fields_of_study',
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/suggests/companies',
        params: mappedParams,
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
    resumeId: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resume_profile/${resumeId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resume_profile/${resumeId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/resume_profile',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-resume-profile-dictionaries', `Получение cловарей резюме-профиля`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/resume_profile/dictionaries',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-payable-api-actions',
  `Information about active API services for payable methods`,
  {
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/services/payable_api_actions/active`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    managerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, managerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers/${managerId}/method_access`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    perPage: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/saved_searches/vacancies',
        params: mappedParams,
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
    perPage: z.string().optional(),
    text: z.string().optional(),
    name: z.string().optional(),
    searchField: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professionalRole: z.string().optional(),
    industry: z.string().optional(),
    employerId: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    onlyWithSalary: z.string().optional(),
    period: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    topLat: z.string().optional(),
    bottomLat: z.string().optional(),
    leftLng: z.string().optional(),
    rightLng: z.string().optional(),
    orderBy: z.string().optional(),
    sortPointLat: z.string().optional(),
    sortPointLng: z.string().optional(),
    clusters: z.string().optional(),
    describeArguments: z.string().optional(),
    noMagic: z.string().optional(),
    premium: z.string().optional(),
    responsesCountEnabled: z.string().optional(),
    partTime: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('searchField' in mappedParams) {
        mappedParams['search_field'] = mappedParams['searchField']
        delete mappedParams['searchField']
      }
      if ('professionalRole' in mappedParams) {
        mappedParams['professional_role'] = mappedParams['professionalRole']
        delete mappedParams['professionalRole']
      }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('onlyWithSalary' in mappedParams) {
        mappedParams['only_with_salary'] = mappedParams['onlyWithSalary']
        delete mappedParams['onlyWithSalary']
      }
      if ('dateFrom' in mappedParams) {
        mappedParams['date_from'] = mappedParams['dateFrom']
        delete mappedParams['dateFrom']
      }
      if ('dateTo' in mappedParams) {
        mappedParams['date_to'] = mappedParams['dateTo']
        delete mappedParams['dateTo']
      }
      if ('topLat' in mappedParams) {
        mappedParams['top_lat'] = mappedParams['topLat']
        delete mappedParams['topLat']
      }
      if ('bottomLat' in mappedParams) {
        mappedParams['bottom_lat'] = mappedParams['bottomLat']
        delete mappedParams['bottomLat']
      }
      if ('leftLng' in mappedParams) {
        mappedParams['left_lng'] = mappedParams['leftLng']
        delete mappedParams['leftLng']
      }
      if ('rightLng' in mappedParams) {
        mappedParams['right_lng'] = mappedParams['rightLng']
        delete mappedParams['rightLng']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('sortPointLat' in mappedParams) {
        mappedParams['sort_point_lat'] = mappedParams['sortPointLat']
        delete mappedParams['sortPointLat']
      }
      if ('sortPointLng' in mappedParams) {
        mappedParams['sort_point_lng'] = mappedParams['sortPointLng']
        delete mappedParams['sortPointLng']
      }
      if ('describeArguments' in mappedParams) {
        mappedParams['describe_arguments'] = mappedParams['describeArguments']
        delete mappedParams['describeArguments']
      }
      if ('noMagic' in mappedParams) {
        mappedParams['no_magic'] = mappedParams['noMagic']
        delete mappedParams['noMagic']
      }
      if ('responsesCountEnabled' in mappedParams) {
        mappedParams['responses_count_enabled'] = mappedParams['responsesCountEnabled']
        delete mappedParams['responsesCountEnabled']
      }
      if ('partTime' in mappedParams) {
        mappedParams['part_time'] = mappedParams['partTime']
        delete mappedParams['partTime']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/saved_searches/vacancies',
        data: mappedParams,
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
    vacancyId: z.string(),
    page: z.string().optional(),
    perPage: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}/visitors`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    vacancyId: z.string(),
    ignoreDuplicates: z.string().optional(),
    ignoreReplacementWarning: z.string().optional(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('ignoreDuplicates' in mappedParams) {
        mappedParams['ignore_duplicates'] = mappedParams['ignoreDuplicates']
        delete mappedParams['ignoreDuplicates']
      }
      if ('ignoreReplacementWarning' in mappedParams) {
        mappedParams['ignore_replacement_warning'] = mappedParams['ignoreReplacementWarning']
        delete mappedParams['ignoreReplacementWarning']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-blacklisted-vacancies', `List of hidden vacancies`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/vacancies/blacklisted',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'publish-vacancy',
  `Publishing job vacancies`,
  {
    ignoreDuplicates: z.string().optional(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('ignoreDuplicates' in mappedParams) {
        mappedParams['ignore_duplicates'] = mappedParams['ignoreDuplicates']
        delete mappedParams['ignoreDuplicates']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/vacancies',
        data: mappedParams,
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
    perPage: z.string().optional(),
    text: z.string().optional(),
    searchField: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professionalRole: z.string().optional(),
    industry: z.string().optional(),
    employerId: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    onlyWithSalary: z.string().optional(),
    period: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    topLat: z.string().optional(),
    bottomLat: z.string().optional(),
    leftLng: z.string().optional(),
    rightLng: z.string().optional(),
    orderBy: z.string().optional(),
    sortPointLat: z.string().optional(),
    sortPointLng: z.string().optional(),
    clusters: z.string().optional(),
    describeArguments: z.string().optional(),
    noMagic: z.string().optional(),
    premium: z.string().optional(),
    responsesCountEnabled: z.string().optional(),
    partTime: z.string().optional(),
    acceptTemporary: z.string().optional(),
    employmentForm: z.string().optional(),
    workScheduleByDays: z.string().optional(),
    workingHours: z.string().optional(),
    workFormat: z.string().optional(),
    excludedText: z.string().optional(),
    education: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('searchField' in mappedParams) {
        mappedParams['search_field'] = mappedParams['searchField']
        delete mappedParams['searchField']
      }
      if ('professionalRole' in mappedParams) {
        mappedParams['professional_role'] = mappedParams['professionalRole']
        delete mappedParams['professionalRole']
      }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('onlyWithSalary' in mappedParams) {
        mappedParams['only_with_salary'] = mappedParams['onlyWithSalary']
        delete mappedParams['onlyWithSalary']
      }
      if ('dateFrom' in mappedParams) {
        mappedParams['date_from'] = mappedParams['dateFrom']
        delete mappedParams['dateFrom']
      }
      if ('dateTo' in mappedParams) {
        mappedParams['date_to'] = mappedParams['dateTo']
        delete mappedParams['dateTo']
      }
      if ('topLat' in mappedParams) {
        mappedParams['top_lat'] = mappedParams['topLat']
        delete mappedParams['topLat']
      }
      if ('bottomLat' in mappedParams) {
        mappedParams['bottom_lat'] = mappedParams['bottomLat']
        delete mappedParams['bottomLat']
      }
      if ('leftLng' in mappedParams) {
        mappedParams['left_lng'] = mappedParams['leftLng']
        delete mappedParams['leftLng']
      }
      if ('rightLng' in mappedParams) {
        mappedParams['right_lng'] = mappedParams['rightLng']
        delete mappedParams['rightLng']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('sortPointLat' in mappedParams) {
        mappedParams['sort_point_lat'] = mappedParams['sortPointLat']
        delete mappedParams['sortPointLat']
      }
      if ('sortPointLng' in mappedParams) {
        mappedParams['sort_point_lng'] = mappedParams['sortPointLng']
        delete mappedParams['sortPointLng']
      }
      if ('describeArguments' in mappedParams) {
        mappedParams['describe_arguments'] = mappedParams['describeArguments']
        delete mappedParams['describeArguments']
      }
      if ('noMagic' in mappedParams) {
        mappedParams['no_magic'] = mappedParams['noMagic']
        delete mappedParams['noMagic']
      }
      if ('responsesCountEnabled' in mappedParams) {
        mappedParams['responses_count_enabled'] = mappedParams['responsesCountEnabled']
        delete mappedParams['responsesCountEnabled']
      }
      if ('partTime' in mappedParams) {
        mappedParams['part_time'] = mappedParams['partTime']
        delete mappedParams['partTime']
      }
      if ('acceptTemporary' in mappedParams) {
        mappedParams['accept_temporary'] = mappedParams['acceptTemporary']
        delete mappedParams['acceptTemporary']
      }
      if ('employmentForm' in mappedParams) {
        mappedParams['employment_form'] = mappedParams['employmentForm']
        delete mappedParams['employmentForm']
      }
      if ('workScheduleByDays' in mappedParams) {
        mappedParams['work_schedule_by_days'] = mappedParams['workScheduleByDays']
        delete mappedParams['workScheduleByDays']
      }
      if ('workingHours' in mappedParams) {
        mappedParams['working_hours'] = mappedParams['workingHours']
        delete mappedParams['workingHours']
      }
      if ('workFormat' in mappedParams) {
        mappedParams['work_format'] = mappedParams['workFormat']
        delete mappedParams['workFormat']
      }
      if ('excludedText' in mappedParams) {
        mappedParams['excluded_text'] = mappedParams['excludedText']
        delete mappedParams['excludedText']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/vacancies',
        params: mappedParams,
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
    vacancyId: z.string(),
    page: z.string().optional(),
    perPage: z.string().optional(),
    text: z.string().optional(),
    searchField: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professionalRole: z.string().optional(),
    industry: z.string().optional(),
    employerId: z.string().optional(),
    excludedEmployerId: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    onlyWithSalary: z.string().optional(),
    period: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    topLat: z.string().optional(),
    bottomLat: z.string().optional(),
    leftLng: z.string().optional(),
    rightLng: z.string().optional(),
    orderBy: z.string().optional(),
    sortPointLat: z.string().optional(),
    sortPointLng: z.string().optional(),
    clusters: z.string().optional(),
    describeArguments: z.string().optional(),
    noMagic: z.string().optional(),
    premium: z.string().optional(),
    responsesCountEnabled: z.string().optional(),
    partTime: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}/related_vacancies`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('searchField' in mappedParams) {
        mappedParams['search_field'] = mappedParams['searchField']
        delete mappedParams['searchField']
      }
      if ('professionalRole' in mappedParams) {
        mappedParams['professional_role'] = mappedParams['professionalRole']
        delete mappedParams['professionalRole']
      }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('excludedEmployerId' in mappedParams) {
        mappedParams['excluded_employer_id'] = mappedParams['excludedEmployerId']
        delete mappedParams['excludedEmployerId']
      }
      if ('onlyWithSalary' in mappedParams) {
        mappedParams['only_with_salary'] = mappedParams['onlyWithSalary']
        delete mappedParams['onlyWithSalary']
      }
      if ('dateFrom' in mappedParams) {
        mappedParams['date_from'] = mappedParams['dateFrom']
        delete mappedParams['dateFrom']
      }
      if ('dateTo' in mappedParams) {
        mappedParams['date_to'] = mappedParams['dateTo']
        delete mappedParams['dateTo']
      }
      if ('topLat' in mappedParams) {
        mappedParams['top_lat'] = mappedParams['topLat']
        delete mappedParams['topLat']
      }
      if ('bottomLat' in mappedParams) {
        mappedParams['bottom_lat'] = mappedParams['bottomLat']
        delete mappedParams['bottomLat']
      }
      if ('leftLng' in mappedParams) {
        mappedParams['left_lng'] = mappedParams['leftLng']
        delete mappedParams['leftLng']
      }
      if ('rightLng' in mappedParams) {
        mappedParams['right_lng'] = mappedParams['rightLng']
        delete mappedParams['rightLng']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('sortPointLat' in mappedParams) {
        mappedParams['sort_point_lat'] = mappedParams['sortPointLat']
        delete mappedParams['sortPointLat']
      }
      if ('sortPointLng' in mappedParams) {
        mappedParams['sort_point_lng'] = mappedParams['sortPointLng']
        delete mappedParams['sortPointLng']
      }
      if ('describeArguments' in mappedParams) {
        mappedParams['describe_arguments'] = mappedParams['describeArguments']
        delete mappedParams['describeArguments']
      }
      if ('noMagic' in mappedParams) {
        mappedParams['no_magic'] = mappedParams['noMagic']
        delete mappedParams['noMagic']
      }
      if ('responsesCountEnabled' in mappedParams) {
        mappedParams['responses_count_enabled'] = mappedParams['responsesCountEnabled']
        delete mappedParams['responsesCountEnabled']
      }
      if ('partTime' in mappedParams) {
        mappedParams['part_time'] = mappedParams['partTime']
        delete mappedParams['partTime']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/saved_searches/vacancies/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/saved_searches/vacancies/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/saved_searches/vacancies/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    vacancyId: z.string(),
    page: z.string().optional(),
    perPage: z.string().optional(),
    text: z.string().optional(),
    searchField: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professionalRole: z.string().optional(),
    industry: z.string().optional(),
    employerId: z.string().optional(),
    excludedEmployerId: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    onlyWithSalary: z.string().optional(),
    period: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    topLat: z.string().optional(),
    bottomLat: z.string().optional(),
    leftLng: z.string().optional(),
    rightLng: z.string().optional(),
    orderBy: z.string().optional(),
    sortPointLat: z.string().optional(),
    sortPointLng: z.string().optional(),
    clusters: z.string().optional(),
    describeArguments: z.string().optional(),
    noMagic: z.string().optional(),
    premium: z.string().optional(),
    responsesCountEnabled: z.string().optional(),
    partTime: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}/similar_vacancies`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('searchField' in mappedParams) {
        mappedParams['search_field'] = mappedParams['searchField']
        delete mappedParams['searchField']
      }
      if ('professionalRole' in mappedParams) {
        mappedParams['professional_role'] = mappedParams['professionalRole']
        delete mappedParams['professionalRole']
      }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('excludedEmployerId' in mappedParams) {
        mappedParams['excluded_employer_id'] = mappedParams['excludedEmployerId']
        delete mappedParams['excludedEmployerId']
      }
      if ('onlyWithSalary' in mappedParams) {
        mappedParams['only_with_salary'] = mappedParams['onlyWithSalary']
        delete mappedParams['onlyWithSalary']
      }
      if ('dateFrom' in mappedParams) {
        mappedParams['date_from'] = mappedParams['dateFrom']
        delete mappedParams['dateFrom']
      }
      if ('dateTo' in mappedParams) {
        mappedParams['date_to'] = mappedParams['dateTo']
        delete mappedParams['dateTo']
      }
      if ('topLat' in mappedParams) {
        mappedParams['top_lat'] = mappedParams['topLat']
        delete mappedParams['topLat']
      }
      if ('bottomLat' in mappedParams) {
        mappedParams['bottom_lat'] = mappedParams['bottomLat']
        delete mappedParams['bottomLat']
      }
      if ('leftLng' in mappedParams) {
        mappedParams['left_lng'] = mappedParams['leftLng']
        delete mappedParams['leftLng']
      }
      if ('rightLng' in mappedParams) {
        mappedParams['right_lng'] = mappedParams['rightLng']
        delete mappedParams['rightLng']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('sortPointLat' in mappedParams) {
        mappedParams['sort_point_lat'] = mappedParams['sortPointLat']
        delete mappedParams['sortPointLat']
      }
      if ('sortPointLng' in mappedParams) {
        mappedParams['sort_point_lng'] = mappedParams['sortPointLng']
        delete mappedParams['sortPointLng']
      }
      if ('describeArguments' in mappedParams) {
        mappedParams['describe_arguments'] = mappedParams['describeArguments']
        delete mappedParams['describeArguments']
      }
      if ('noMagic' in mappedParams) {
        mappedParams['no_magic'] = mappedParams['noMagic']
        delete mappedParams['noMagic']
      }
      if ('responsesCountEnabled' in mappedParams) {
        mappedParams['responses_count_enabled'] = mappedParams['responsesCountEnabled']
        delete mappedParams['responsesCountEnabled']
      }
      if ('partTime' in mappedParams) {
        mappedParams['part_time'] = mappedParams['partTime']
        delete mappedParams['partTime']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}/upgrades`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
    page: z.string().optional(),
    perPage: z.string().optional(),
    text: z.string().optional(),
    searchField: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    schedule: z.string().optional(),
    area: z.string().optional(),
    metro: z.string().optional(),
    professionalRole: z.string().optional(),
    industry: z.string().optional(),
    employerId: z.string().optional(),
    excludedEmployerId: z.string().optional(),
    currency: z.string().optional(),
    salary: z.string().optional(),
    label: z.string().optional(),
    onlyWithSalary: z.string().optional(),
    period: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    topLat: z.string().optional(),
    bottomLat: z.string().optional(),
    leftLng: z.string().optional(),
    rightLng: z.string().optional(),
    orderBy: z.string().optional(),
    sortPointLat: z.string().optional(),
    sortPointLng: z.string().optional(),
    clusters: z.string().optional(),
    describeArguments: z.string().optional(),
    noMagic: z.string().optional(),
    premium: z.string().optional(),
    responsesCountEnabled: z.string().optional(),
    partTime: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}/similar_vacancies`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('searchField' in mappedParams) {
        mappedParams['search_field'] = mappedParams['searchField']
        delete mappedParams['searchField']
      }
      if ('professionalRole' in mappedParams) {
        mappedParams['professional_role'] = mappedParams['professionalRole']
        delete mappedParams['professionalRole']
      }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('excludedEmployerId' in mappedParams) {
        mappedParams['excluded_employer_id'] = mappedParams['excludedEmployerId']
        delete mappedParams['excludedEmployerId']
      }
      if ('onlyWithSalary' in mappedParams) {
        mappedParams['only_with_salary'] = mappedParams['onlyWithSalary']
        delete mappedParams['onlyWithSalary']
      }
      if ('dateFrom' in mappedParams) {
        mappedParams['date_from'] = mappedParams['dateFrom']
        delete mappedParams['dateFrom']
      }
      if ('dateTo' in mappedParams) {
        mappedParams['date_to'] = mappedParams['dateTo']
        delete mappedParams['dateTo']
      }
      if ('topLat' in mappedParams) {
        mappedParams['top_lat'] = mappedParams['topLat']
        delete mappedParams['topLat']
      }
      if ('bottomLat' in mappedParams) {
        mappedParams['bottom_lat'] = mappedParams['bottomLat']
        delete mappedParams['bottomLat']
      }
      if ('leftLng' in mappedParams) {
        mappedParams['left_lng'] = mappedParams['leftLng']
        delete mappedParams['leftLng']
      }
      if ('rightLng' in mappedParams) {
        mappedParams['right_lng'] = mappedParams['rightLng']
        delete mappedParams['rightLng']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('sortPointLat' in mappedParams) {
        mappedParams['sort_point_lat'] = mappedParams['sortPointLat']
        delete mappedParams['sortPointLat']
      }
      if ('sortPointLng' in mappedParams) {
        mappedParams['sort_point_lng'] = mappedParams['sortPointLng']
        delete mappedParams['sortPointLng']
      }
      if ('describeArguments' in mappedParams) {
        mappedParams['describe_arguments'] = mappedParams['describeArguments']
        delete mappedParams['describeArguments']
      }
      if ('noMagic' in mappedParams) {
        mappedParams['no_magic'] = mappedParams['noMagic']
        delete mappedParams['noMagic']
      }
      if ('responsesCountEnabled' in mappedParams) {
        mappedParams['responses_count_enabled'] = mappedParams['responsesCountEnabled']
        delete mappedParams['responsesCountEnabled']
      }
      if ('partTime' in mappedParams) {
        mappedParams['part_time'] = mappedParams['partTime']
        delete mappedParams['partTime']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    perPage: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/vacancies/favorited',
        params: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/blacklisted/${vacancyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/blacklisted/${vacancyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    page: z.string().optional(),
    perPage: z.string().optional(),
    managerId: z.string().optional(),
    text: z.string().optional(),
    area: z.string().optional(),
    resumeId: z.string().optional(),
    orderBy: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/vacancies/active`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    managerId: z.string().optional(),
    orderBy: z.string().optional(),
    perPage: z.string().optional(),
    page: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/vacancies/hidden`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, vacancyId, ...otherParams } = args
      const url = `/employers/${employerId}/vacancies/hidden/${vacancyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    employerId: z.string(),
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, vacancyId, ...otherParams } = args
      const url = `/employers/${employerId}/vacancies/hidden/${vacancyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
  {},
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/vacancy_conditions',
        params: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}/prolongate`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}/prolongate`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
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
    employerId: z.string(),
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, vacancyId, ...otherParams } = args
      const url = `/employers/${employerId}/vacancies/archived/${vacancyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/vacancies/${id}/preferred_negotiations_order`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/vacancies/${id}/preferred_negotiations_order`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/favorited/${vacancyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/favorited/${vacancyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    managerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, managerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers/${managerId}/vacancies/available_types`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}/stats`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
    managerId: z.string().optional(),
    orderBy: z.string().optional(),
    perPage: z.string().optional(),
    page: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/vacancies/archived`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-artifacts-portfolio-conditions', `Conditions for uploading portfolio`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/artifacts/portfolio/conditions',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'edit-artifact',
  `Editing an artifact`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/artifacts/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/artifacts/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('load-artifact', `Uploading an artifact`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = (args as any).requestData || { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'POST',
      url: '/artifacts',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-artifacts-portfolio', `Getting portfolios`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/artifacts/portfolio',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-artifact-photos-conditions', `Conditions for uploading photos`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/artifacts/photo/conditions',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-artifact-photos', `Getting photos`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/artifacts/photo',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-dictionaries', `Directories of fields`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/dictionaries',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-languages', `The list of all languages`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/languages',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-educational-institutions-dictionary',
  `Basic information about educational institutions`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/educational_institutions',
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/skills',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-professional-roles-dictionary', `Professional role directory`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/professional_roles',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-faculties',
  `List of educational institution faculties`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/educational_institutions/${id}/faculties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-industries', `Industries`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/industries',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'change-negotiation-action',
  `Actions with collection response/invitation`,
  {
    collectionName: z.string(),
    nid: z.string(),
  },
  async (args, extra) => {
    try {
      const { collectionName, nid, ...otherParams } = args
      const url = `/negotiations/${collectionName}/${nid}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('collectionName' in mappedParams) {
        mappedParams['collection_name'] = mappedParams['collectionName']
        delete mappedParams['collectionName']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('apply-to-vacancy', `Apply for a vacancy`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = (args as any).requestData || { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'POST',
      url: '/negotiations',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-negotiations',
  `Negotiation list`,
  {
    page: z.string().optional(),
    perPage: z.string().optional(),
    orderBy: z.string().optional(),
    order: z.string().optional(),
    vacancyId: z.string().optional(),
    status: z.string().optional(),
    hasUpdates: z.string().optional(),
    withJobSearchStatus: z.string().optional(),
    withGeneratedCollections: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('hasUpdates' in mappedParams) {
        mappedParams['has_updates'] = mappedParams['hasUpdates']
        delete mappedParams['hasUpdates']
      }
      if ('withJobSearchStatus' in mappedParams) {
        mappedParams['with_job_search_status'] = mappedParams['withJobSearchStatus']
        delete mappedParams['withJobSearchStatus']
      }
      if ('withGeneratedCollections' in mappedParams) {
        mappedParams['with_generated_collections'] = mappedParams['withGeneratedCollections']
        delete mappedParams['withGeneratedCollections']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/negotiations',
        params: mappedParams,
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
    employerId: z.string(),
    managerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, managerId, ...otherParams } = args
      const url = `/employers/${employerId}/managers/${managerId}/negotiations_statistics`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    perPage: z.string().optional(),
    orderBy: z.string().optional(),
    order: z.string().optional(),
    vacancyId: z.string().optional(),
    hasUpdates: z.string().optional(),
    withJobSearchStatus: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('hasUpdates' in mappedParams) {
        mappedParams['has_updates'] = mappedParams['hasUpdates']
        delete mappedParams['hasUpdates']
      }
      if ('withJobSearchStatus' in mappedParams) {
        mappedParams['with_job_search_status'] = mappedParams['withJobSearchStatus']
        delete mappedParams['withJobSearchStatus']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/negotiations/active',
        params: mappedParams,
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
    topicId: z.string().optional(),
    vacancyId: z.string().optional(),
    resumeId: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { template, ...otherParams } = args
      const url = `/message_templates/${template}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('topicId' in mappedParams) {
        mappedParams['topic_id'] = mappedParams['topicId']
        delete mappedParams['topicId']
      }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    vacancyId: z.string(),
    orderBy: z.string().optional(),
    page: z.string().optional(),
    perPage: z.string().optional(),
    ageFrom: z.string().optional(),
    ageTo: z.string().optional(),
    area: z.string().optional(),
    citizenship: z.string().optional(),
    currency: z.string().optional(),
    driverLicenseTypes: z.string().optional(),
    educationalInstitution: z.string().optional(),
    educationLevel: z.string().optional(),
    experience: z.string().optional(),
    gender: z.string().optional(),
    language: z.string().optional(),
    relocation: z.string().optional(),
    salaryFrom: z.string().optional(),
    salaryTo: z.string().optional(),
    searchRadiusMeters: z.string().optional(),
    searchText: z.string().optional(),
    showOnlyNewResponses: z.string().optional(),
    showOnlyWithVehicle: z.string().optional(),
    showOnlyNew: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('ageFrom' in mappedParams) {
        mappedParams['age_from'] = mappedParams['ageFrom']
        delete mappedParams['ageFrom']
      }
      if ('ageTo' in mappedParams) {
        mappedParams['age_to'] = mappedParams['ageTo']
        delete mappedParams['ageTo']
      }
      if ('driverLicenseTypes' in mappedParams) {
        mappedParams['driver_license_types'] = mappedParams['driverLicenseTypes']
        delete mappedParams['driverLicenseTypes']
      }
      if ('educationalInstitution' in mappedParams) {
        mappedParams['educational_institution'] = mappedParams['educationalInstitution']
        delete mappedParams['educationalInstitution']
      }
      if ('educationLevel' in mappedParams) {
        mappedParams['education_level'] = mappedParams['educationLevel']
        delete mappedParams['educationLevel']
      }
      if ('salaryFrom' in mappedParams) {
        mappedParams['salary_from'] = mappedParams['salaryFrom']
        delete mappedParams['salaryFrom']
      }
      if ('salaryTo' in mappedParams) {
        mappedParams['salary_to'] = mappedParams['salaryTo']
        delete mappedParams['salaryTo']
      }
      if ('searchRadiusMeters' in mappedParams) {
        mappedParams['search_radius_meters'] = mappedParams['searchRadiusMeters']
        delete mappedParams['searchRadiusMeters']
      }
      if ('searchText' in mappedParams) {
        mappedParams['search_text'] = mappedParams['searchText']
        delete mappedParams['searchText']
      }
      if ('showOnlyNewResponses' in mappedParams) {
        mappedParams['show_only_new_responses'] = mappedParams['showOnlyNewResponses']
        delete mappedParams['showOnlyNewResponses']
      }
      if ('showOnlyWithVehicle' in mappedParams) {
        mappedParams['show_only_with_vehicle'] = mappedParams['showOnlyWithVehicle']
        delete mappedParams['showOnlyWithVehicle']
      }
      if ('showOnlyNew' in mappedParams) {
        mappedParams['show_only_new'] = mappedParams['showOnlyNew']
        delete mappedParams['showOnlyNew']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/negotiations/response',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('invite-applicant-to-vacancy', `Invite applicant for a vacancy`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = (args as any).requestData || { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'POST',
      url: '/negotiations/phone_interview',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-negotiation-test-results',
  `Get test results attached to the vacancy`,
  {
    nid: z.string(),
  },
  async (args, extra) => {
    try {
      const { nid, ...otherParams } = args
      const url = `/negotiations/${nid}/test/solution`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const { nid, mid, ...otherParams } = args
      const url = `/negotiations/${nid}/messages/${mid}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('post-negotiations-topics-read', `Mark responses as read`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = (args as any).requestData || { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'POST',
      url: '/negotiations/read',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'hide-active-response',
  `Hide response`,
  {
    nid: z.string(),
    withDeclineMessage: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { nid, ...otherParams } = args
      const url = `/negotiations/active/${nid}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('withDeclineMessage' in mappedParams) {
        mappedParams['with_decline_message'] = mappedParams['withDeclineMessage']
        delete mappedParams['withDeclineMessage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/negotiations/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/negotiations/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/negotiations_statistics`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const { nid, ...otherParams } = args
      const url = `/negotiations/${nid}/messages`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
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
    withTextOnly: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { nid, ...otherParams } = args
      const url = `/negotiations/${nid}/messages`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('withTextOnly' in mappedParams) {
        mappedParams['with_text_only'] = mappedParams['withTextOnly']
        delete mappedParams['withTextOnly']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    draftId: z.string(),
  },
  async (args, extra) => {
    try {
      const { draftId, ...otherParams } = args
      const url = `/vacancies/drafts/${draftId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('draftId' in mappedParams) {
        mappedParams['draft_id'] = mappedParams['draftId']
        delete mappedParams['draftId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    draftId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { draftId, ...otherParams } = args
      const url = `/vacancies/drafts/${draftId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('draftId' in mappedParams) {
        mappedParams['draft_id'] = mappedParams['draftId']
        delete mappedParams['draftId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    draftId: z.string(),
  },
  async (args, extra) => {
    try {
      const { draftId, ...otherParams } = args
      const url = `/vacancies/drafts/${draftId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('draftId' in mappedParams) {
        mappedParams['draft_id'] = mappedParams['draftId']
        delete mappedParams['draftId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    draftId: z.string(),
  },
  async (args, extra) => {
    try {
      const { draftId, ...otherParams } = args
      const url = `/vacancies/drafts/${draftId}/publish`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('draftId' in mappedParams) {
        mappedParams['draft_id'] = mappedParams['draftId']
        delete mappedParams['draftId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
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
    draftId: z.string(),
  },
  async (args, extra) => {
    try {
      const { draftId, ...otherParams } = args
      const url = `/vacancies/drafts/${draftId}/duplicates`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('draftId' in mappedParams) {
        mappedParams['draft_id'] = mappedParams['draftId']
        delete mappedParams['draftId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/vacancies/drafts',
        data: mappedParams,
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
    perPage: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/vacancies/drafts',
        params: mappedParams,
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
    draftId: z.string(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('draftId' in mappedParams) {
        mappedParams['draft_id'] = mappedParams['draftId']
        delete mappedParams['draftId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: '/vacancies/auto_publication',
        params: mappedParams,
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
    subscriptionId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { subscriptionId, ...otherParams } = args
      const url = `/webhook/subscriptions/${subscriptionId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('subscriptionId' in mappedParams) {
        mappedParams['subscription_id'] = mappedParams['subscriptionId']
        delete mappedParams['subscriptionId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    subscriptionId: z.string(),
  },
  async (args, extra) => {
    try {
      const { subscriptionId, ...otherParams } = args
      const url = `/webhook/subscriptions/${subscriptionId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('subscriptionId' in mappedParams) {
        mappedParams['subscription_id'] = mappedParams['subscriptionId']
        delete mappedParams['subscriptionId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/webhook/subscriptions',
        data: mappedParams,
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
  {},
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/webhook/subscriptions',
        params: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/tests`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/vacancy_areas/active`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/blacklisted/${employerId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/blacklisted/${employerId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    onlyWithVacancies: z.string().optional(),
    sortBy: z.string().optional(),
    page: z.string().optional(),
    perPage: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('onlyWithVacancies' in mappedParams) {
        mappedParams['only_with_vacancies'] = mappedParams['onlyWithVacancies']
        delete mappedParams['onlyWithVacancies']
      }
      if ('sortBy' in mappedParams) {
        mappedParams['sort_by'] = mappedParams['sortBy']
        delete mappedParams['sortBy']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/employers',
        params: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/departments`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/vacancy_branded_templates`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-blacklisted-employers', `List of hidden employers`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/employers/blacklisted',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-all-districts', `List of available city districts`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/districts',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-salary-evaluation',
  `Salary assessment without forecasts`,
  {
    areaId: z.string(),
    excludeArea: z.string().optional(),
    employeeLevel: z.string().optional(),
    industry: z.string().optional(),
    speciality: z.string().optional(),
    extendSources: z.string().optional(),
    positionName: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { areaId, ...otherParams } = args
      const url = `/salary_statistics/paid/salary_evaluation/${areaId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('areaId' in mappedParams) {
        mappedParams['area_id'] = mappedParams['areaId']
        delete mappedParams['areaId']
      }
      if ('excludeArea' in mappedParams) {
        mappedParams['exclude_area'] = mappedParams['excludeArea']
        delete mappedParams['excludeArea']
      }
      if ('employeeLevel' in mappedParams) {
        mappedParams['employee_level'] = mappedParams['employeeLevel']
        delete mappedParams['employeeLevel']
      }
      if ('extendSources' in mappedParams) {
        mappedParams['extend_sources'] = mappedParams['extendSources']
        delete mappedParams['extendSources']
      }
      if ('positionName' in mappedParams) {
        mappedParams['position_name'] = mappedParams['positionName']
        delete mappedParams['positionName']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-metro-stations', `The list of metro stations in all cities`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/metro',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-metro-stations-in-city',
  `The list of metro stations in the specified city`,
  {
    cityId: z.string(),
  },
  async (args, extra) => {
    try {
      const { cityId, ...otherParams } = args
      const url = `/metro/${cityId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('cityId' in mappedParams) {
        mappedParams['city_id'] = mappedParams['cityId']
        delete mappedParams['cityId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    savedSearchId: z.string(),
    managerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { savedSearchId, managerId, ...otherParams } = args
      const url = `/saved_searches/resumes/${savedSearchId}/managers/${managerId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('savedSearchId' in mappedParams) {
        mappedParams['saved_search_id'] = mappedParams['savedSearchId']
        delete mappedParams['savedSearchId']
      }
      if ('managerId' in mappedParams) {
        mappedParams['manager_id'] = mappedParams['managerId']
        delete mappedParams['managerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}/resumes_by_status`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}/status`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}/negotiations_history`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/saved_searches/resumes/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/saved_searches/resumes/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/saved_searches/resumes/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    sourceResumeId: z.string().optional(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('sourceResumeId' in mappedParams) {
        mappedParams['source_resume_id'] = mappedParams['sourceResumeId']
        delete mappedParams['sourceResumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/resumes',
        data: mappedParams,
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
    textLogic: z.string().optional(),
    textField: z.string().optional(),
    textPeriod: z.string().optional(),
    textCompanySize: z.string().optional(),
    textIndustry: z.string().optional(),
    ageFrom: z.string().optional(),
    ageTo: z.string().optional(),
    area: z.string().optional(),
    relocation: z.string().optional(),
    period: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    educationLevel: z.string().optional(),
    employment: z.string().optional(),
    experience: z.string().optional(),
    skill: z.string().optional(),
    gender: z.string().optional(),
    label: z.string().optional(),
    language: z.string().optional(),
    metro: z.string().optional(),
    currency: z.string().optional(),
    salaryFrom: z.string().optional(),
    salaryTo: z.string().optional(),
    schedule: z.string().optional(),
    orderBy: z.string().optional(),
    citizenship: z.string().optional(),
    workTicket: z.string().optional(),
    educationalInstitution: z.string().optional(),
    searchInResponses: z.string().optional(),
    byTextPrefix: z.string().optional(),
    driverLicenseTypes: z.string().optional(),
    vacancyId: z.string().optional(),
    page: z.string().optional(),
    perPage: z.string().optional(),
    professionalRole: z.string().optional(),
    folder: z.string().optional(),
    includeAllFolders: z.string().optional(),
    jobSearchStatus: z.string().optional(),
    resume: z.string().optional(),
    filterExpIndustry: z.string().optional(),
    filterExpPeriod: z.string().optional(),
    withJobSearchStatus: z.string().optional(),
    educationLevels: z.string().optional(),
    district: z.string().optional(),
    savedSearchId: z.string().optional(),
    searchByVacancyId: z.string().optional(),
    lastUsedTimestamp: z.string().optional(),
    lastUsed: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('textLogic' in mappedParams) {
        mappedParams['text.logic'] = mappedParams['textLogic']
        delete mappedParams['textLogic']
      }
      if ('textField' in mappedParams) {
        mappedParams['text.field'] = mappedParams['textField']
        delete mappedParams['textField']
      }
      if ('textPeriod' in mappedParams) {
        mappedParams['text.period'] = mappedParams['textPeriod']
        delete mappedParams['textPeriod']
      }
      if ('textCompanySize' in mappedParams) {
        mappedParams['text.company_size'] = mappedParams['textCompanySize']
        delete mappedParams['textCompanySize']
      }
      if ('textIndustry' in mappedParams) {
        mappedParams['text.industry'] = mappedParams['textIndustry']
        delete mappedParams['textIndustry']
      }
      if ('ageFrom' in mappedParams) {
        mappedParams['age_from'] = mappedParams['ageFrom']
        delete mappedParams['ageFrom']
      }
      if ('ageTo' in mappedParams) {
        mappedParams['age_to'] = mappedParams['ageTo']
        delete mappedParams['ageTo']
      }
      if ('dateFrom' in mappedParams) {
        mappedParams['date_from'] = mappedParams['dateFrom']
        delete mappedParams['dateFrom']
      }
      if ('dateTo' in mappedParams) {
        mappedParams['date_to'] = mappedParams['dateTo']
        delete mappedParams['dateTo']
      }
      if ('educationLevel' in mappedParams) {
        mappedParams['education_level'] = mappedParams['educationLevel']
        delete mappedParams['educationLevel']
      }
      if ('salaryFrom' in mappedParams) {
        mappedParams['salary_from'] = mappedParams['salaryFrom']
        delete mappedParams['salaryFrom']
      }
      if ('salaryTo' in mappedParams) {
        mappedParams['salary_to'] = mappedParams['salaryTo']
        delete mappedParams['salaryTo']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('workTicket' in mappedParams) {
        mappedParams['work_ticket'] = mappedParams['workTicket']
        delete mappedParams['workTicket']
      }
      if ('educationalInstitution' in mappedParams) {
        mappedParams['educational_institution'] = mappedParams['educationalInstitution']
        delete mappedParams['educationalInstitution']
      }
      if ('searchInResponses' in mappedParams) {
        mappedParams['search_in_responses'] = mappedParams['searchInResponses']
        delete mappedParams['searchInResponses']
      }
      if ('byTextPrefix' in mappedParams) {
        mappedParams['by_text_prefix'] = mappedParams['byTextPrefix']
        delete mappedParams['byTextPrefix']
      }
      if ('driverLicenseTypes' in mappedParams) {
        mappedParams['driver_license_types'] = mappedParams['driverLicenseTypes']
        delete mappedParams['driverLicenseTypes']
      }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('professionalRole' in mappedParams) {
        mappedParams['professional_role'] = mappedParams['professionalRole']
        delete mappedParams['professionalRole']
      }
      if ('includeAllFolders' in mappedParams) {
        mappedParams['include_all_folders'] = mappedParams['includeAllFolders']
        delete mappedParams['includeAllFolders']
      }
      if ('jobSearchStatus' in mappedParams) {
        mappedParams['job_search_status'] = mappedParams['jobSearchStatus']
        delete mappedParams['jobSearchStatus']
      }
      if ('filterExpIndustry' in mappedParams) {
        mappedParams['filter_exp_industry'] = mappedParams['filterExpIndustry']
        delete mappedParams['filterExpIndustry']
      }
      if ('filterExpPeriod' in mappedParams) {
        mappedParams['filter_exp_period'] = mappedParams['filterExpPeriod']
        delete mappedParams['filterExpPeriod']
      }
      if ('withJobSearchStatus' in mappedParams) {
        mappedParams['with_job_search_status'] = mappedParams['withJobSearchStatus']
        delete mappedParams['withJobSearchStatus']
      }
      if ('educationLevels' in mappedParams) {
        mappedParams['education_levels'] = mappedParams['educationLevels']
        delete mappedParams['educationLevels']
      }
      if ('savedSearchId' in mappedParams) {
        mappedParams['saved_search_id'] = mappedParams['savedSearchId']
        delete mappedParams['savedSearchId']
      }
      if ('searchByVacancyId' in mappedParams) {
        mappedParams['search_by_vacancy_id'] = mappedParams['searchByVacancyId']
        delete mappedParams['searchByVacancyId']
      }
      if ('lastUsedTimestamp' in mappedParams) {
        mappedParams['last_used_timestamp'] = mappedParams['lastUsedTimestamp']
        delete mappedParams['lastUsedTimestamp']
      }
      if ('lastUsed' in mappedParams) {
        mappedParams['last_used'] = mappedParams['lastUsed']
        delete mappedParams['lastUsed']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/resumes',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-mine-resumes', `List of resumes for current user`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/resumes/mine',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'publish-resume',
  `Resume publication`,
  {
    resumeId: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}/publish`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
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
  {},
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/resume_conditions',
        params: mappedParams,
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
    vacancyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { vacancyId, ...otherParams } = args
      const url = `/vacancies/${vacancyId}/suitable_resumes`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}/conditions`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
    withEmployerLogo: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}/views`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }
      if ('withEmployerLogo' in mappedParams) {
        mappedParams['with_employer_logo'] = mappedParams['withEmployerLogo']
        delete mappedParams['withEmployerLogo']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
    withNegotiationsHistory: z.string().optional(),
    withCreds: z.string().optional(),
    withJobSearchStatus: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }
      if ('withNegotiationsHistory' in mappedParams) {
        mappedParams['with_negotiations_history'] = mappedParams['withNegotiationsHistory']
        delete mappedParams['withNegotiationsHistory']
      }
      if ('withCreds' in mappedParams) {
        mappedParams['with_creds'] = mappedParams['withCreds']
        delete mappedParams['withCreds']
      }
      if ('withJobSearchStatus' in mappedParams) {
        mappedParams['with_job_search_status'] = mappedParams['withJobSearchStatus']
        delete mappedParams['withJobSearchStatus']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-resume-creation-availability', `Availability of resume creation`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/resumes/creation_availability',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-saved-resume-searches',
  `List of Saved resume searches`,
  {
    page: z.string().optional(),
    perPage: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/saved_searches/resumes',
        params: mappedParams,
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
    textLogic: z.string().optional(),
    textField: z.string().optional(),
    textPeriod: z.string().optional(),
    ageFrom: z.string().optional(),
    ageTo: z.string().optional(),
    area: z.string().optional(),
    relocation: z.string().optional(),
    period: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    educationLevel: z.string().optional(),
    employment: z.string().optional(),
    experience: z.string().optional(),
    skill: z.string().optional(),
    gender: z.string().optional(),
    label: z.string().optional(),
    language: z.string().optional(),
    metro: z.string().optional(),
    currency: z.string().optional(),
    salaryFrom: z.string().optional(),
    salaryTo: z.string().optional(),
    schedule: z.string().optional(),
    orderBy: z.string().optional(),
    citizenship: z.string().optional(),
    workTicket: z.string().optional(),
    educationalInstitution: z.string().optional(),
    searchInResponses: z.string().optional(),
    byTextPrefix: z.string().optional(),
    driverLicenseTypes: z.string().optional(),
    vacancyId: z.string().optional(),
    page: z.string().optional(),
    perPage: z.string().optional(),
    professionalRole: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('textLogic' in mappedParams) {
        mappedParams['text.logic'] = mappedParams['textLogic']
        delete mappedParams['textLogic']
      }
      if ('textField' in mappedParams) {
        mappedParams['text.field'] = mappedParams['textField']
        delete mappedParams['textField']
      }
      if ('textPeriod' in mappedParams) {
        mappedParams['text.period'] = mappedParams['textPeriod']
        delete mappedParams['textPeriod']
      }
      if ('ageFrom' in mappedParams) {
        mappedParams['age_from'] = mappedParams['ageFrom']
        delete mappedParams['ageFrom']
      }
      if ('ageTo' in mappedParams) {
        mappedParams['age_to'] = mappedParams['ageTo']
        delete mappedParams['ageTo']
      }
      if ('dateFrom' in mappedParams) {
        mappedParams['date_from'] = mappedParams['dateFrom']
        delete mappedParams['dateFrom']
      }
      if ('dateTo' in mappedParams) {
        mappedParams['date_to'] = mappedParams['dateTo']
        delete mappedParams['dateTo']
      }
      if ('educationLevel' in mappedParams) {
        mappedParams['education_level'] = mappedParams['educationLevel']
        delete mappedParams['educationLevel']
      }
      if ('salaryFrom' in mappedParams) {
        mappedParams['salary_from'] = mappedParams['salaryFrom']
        delete mappedParams['salaryFrom']
      }
      if ('salaryTo' in mappedParams) {
        mappedParams['salary_to'] = mappedParams['salaryTo']
        delete mappedParams['salaryTo']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('workTicket' in mappedParams) {
        mappedParams['work_ticket'] = mappedParams['workTicket']
        delete mappedParams['workTicket']
      }
      if ('educationalInstitution' in mappedParams) {
        mappedParams['educational_institution'] = mappedParams['educationalInstitution']
        delete mappedParams['educationalInstitution']
      }
      if ('searchInResponses' in mappedParams) {
        mappedParams['search_in_responses'] = mappedParams['searchInResponses']
        delete mappedParams['searchInResponses']
      }
      if ('byTextPrefix' in mappedParams) {
        mappedParams['by_text_prefix'] = mappedParams['byTextPrefix']
        delete mappedParams['byTextPrefix']
      }
      if ('driverLicenseTypes' in mappedParams) {
        mappedParams['driver_license_types'] = mappedParams['driverLicenseTypes']
        delete mappedParams['driverLicenseTypes']
      }
      if ('vacancyId' in mappedParams) {
        mappedParams['vacancy_id'] = mappedParams['vacancyId']
        delete mappedParams['vacancyId']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('professionalRole' in mappedParams) {
        mappedParams['professional_role'] = mappedParams['professionalRole']
        delete mappedParams['professionalRole']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/saved_searches/resumes',
        data: mappedParams,
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
    resumeId: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, ...otherParams } = args
      const url = `/resumes/${resumeId}/access_types`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    applicantId: z.string(),
    commentId: z.string(),
  },
  async (args, extra) => {
    try {
      const { applicantId, commentId, ...otherParams } = args
      const url = `/applicant_comments/${applicantId}/${commentId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('applicantId' in mappedParams) {
        mappedParams['applicant_id'] = mappedParams['applicantId']
        delete mappedParams['applicantId']
      }
      if ('commentId' in mappedParams) {
        mappedParams['comment_id'] = mappedParams['commentId']
        delete mappedParams['commentId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    applicantId: z.string(),
    commentId: z.string(),
  },
  async (args, extra) => {
    try {
      const { applicantId, commentId, ...otherParams } = args
      const url = `/applicant_comments/${applicantId}/${commentId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('applicantId' in mappedParams) {
        mappedParams['applicant_id'] = mappedParams['applicantId']
        delete mappedParams['applicantId']
      }
      if ('commentId' in mappedParams) {
        mappedParams['comment_id'] = mappedParams['commentId']
        delete mappedParams['commentId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    applicantId: z.string(),
    page: z.string().optional(),
    perPage: z.string().optional(),
    orderBy: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { applicantId, ...otherParams } = args
      const url = `/applicant_comments/${applicantId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('applicantId' in mappedParams) {
        mappedParams['applicant_id'] = mappedParams['applicantId']
        delete mappedParams['applicantId']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    applicantId: z.string(),
  },
  async (args, extra) => {
    try {
      const { applicantId, ...otherParams } = args
      const url = `/applicant_comments/${applicantId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('applicantId' in mappedParams) {
        mappedParams['applicant_id'] = mappedParams['applicantId']
        delete mappedParams['applicantId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
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
    employerId: z.string(),
    templateId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { employerId, templateId, ...otherParams } = args
      const url = `/employers/${employerId}/mail_templates/${templateId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }
      if ('templateId' in mappedParams) {
        mappedParams['template_id'] = mappedParams['templateId']
        delete mappedParams['templateId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
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
    employerId: z.string(),
  },
  async (args, extra) => {
    try {
      const { employerId, ...otherParams } = args
      const url = `/employers/${employerId}/mail_templates`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('employerId' in mappedParams) {
        mappedParams['employer_id'] = mappedParams['employerId']
        delete mappedParams['employerId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    dateFrom: z.string(),
    dateTo: z.string(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('dateFrom' in mappedParams) {
        mappedParams['date_from'] = mappedParams['dateFrom']
        delete mappedParams['dateFrom']
      }
      if ('dateTo' in mappedParams) {
        mappedParams['date_to'] = mappedParams['dateTo']
        delete mappedParams['dateTo']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/clickme/statistics',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-countries', `Countries`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/areas/countries',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-areas',
  `Tree view of all regions`,
  {
    additionalCase: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('additionalCase' in mappedParams) {
        mappedParams['additional_case'] = mappedParams['additionalCase']
        delete mappedParams['additionalCase']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/areas',
        params: mappedParams,
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
    areaId: z.string(),
    additionalCase: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { areaId, ...otherParams } = args
      const url = `/areas/${areaId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('areaId' in mappedParams) {
        mappedParams['area_id'] = mappedParams['areaId']
        delete mappedParams['areaId']
      }
      if ('additionalCase' in mappedParams) {
        mappedParams['additional_case'] = mappedParams['additionalCase']
        delete mappedParams['additionalCase']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-salary-employee-levels', `Competency levels`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/salary_statistics/dictionaries/employee_levels',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-salary-salary-areas', `Regions and cities`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/salary_statistics/dictionaries/salary_areas',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-salary-professional-areas', `Professions and specializations`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/salary_statistics/dictionaries/professional_areas',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-salary-industries', `Industries and fields of expertise`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/salary_statistics/dictionaries/salary_industries',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-resume-visibility-employers-list',
  `Searching for employers to add to the visibility list`,
  {
    resumeId: z.string(),
    listType: z.string(),
    text: z.string(),
    perPage: z.string().optional(),
    page: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { resumeId, listType, ...otherParams } = args
      const url = `/resumes/${resumeId}/${listType}/search`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }
      if ('listType' in mappedParams) {
        mappedParams['list_type'] = mappedParams['listType']
        delete mappedParams['listType']
      }
      if ('perPage' in mappedParams) {
        mappedParams['per_page'] = mappedParams['perPage']
        delete mappedParams['perPage']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
    listType: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, listType, ...otherParams } = args
      const url = `/resumes/${resumeId}/${listType}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }
      if ('listType' in mappedParams) {
        mappedParams['list_type'] = mappedParams['listType']
        delete mappedParams['listType']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
    listType: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { resumeId, listType, ...otherParams } = args
      const url = `/resumes/${resumeId}/${listType}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }
      if ('listType' in mappedParams) {
        mappedParams['list_type'] = mappedParams['listType']
        delete mappedParams['listType']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
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
    resumeId: z.string(),
    listType: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, listType, ...otherParams } = args
      const url = `/resumes/${resumeId}/${listType}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }
      if ('listType' in mappedParams) {
        mappedParams['list_type'] = mappedParams['listType']
        delete mappedParams['listType']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
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
    resumeId: z.string(),
    listType: z.string(),
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { resumeId, listType, ...otherParams } = args
      const url = `/resumes/${resumeId}/${listType}/employer`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('resumeId' in mappedParams) {
        mappedParams['resume_id'] = mappedParams['resumeId']
        delete mappedParams['resumeId']
      }
      if ('listType' in mappedParams) {
        mappedParams['list_type'] = mappedParams['listType']
        delete mappedParams['listType']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)
