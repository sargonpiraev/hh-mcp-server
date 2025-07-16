#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

// Load environment variables
dotenv.config()

// Environment configuration schema
const envSchema = z.object({
  HH_USER_AGENT: z.string().min(1),
  //  TOOL_GLOB_PATTERNS: z.string().optional(),
  //  LOG_LEVEL: z.enum(['debug', 'info', 'notice', 'warning', 'error']).default('info').optional(),
})

// Parse and validate environment variables
const env = envSchema.parse(process.env)

const mcpServer = new McpServer(
  {
    name: '@sargonpiraev/hh-mcp-server',
    version: '',
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
    instructions: `MCP Server for HeadHunter API - job search and vacancy management`,
  }
)

const logger = {
  log: (...message: (string | object)[]) =>
    mcpServer.server.sendLoggingMessage({ level: 'info', data: message.join(' ') }),
  error: (...message: (string | object)[]) =>
    mcpServer.server.sendLoggingMessage({ level: 'error', data: message.join(' ') }),
  debug: (...message: (string | object)[]) =>
    mcpServer.server.sendLoggingMessage({ level: 'debug', data: message.join(' ') }),
}

// Axios client setup
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.hh.ru',
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000,
})

// Add request interceptor for environment variables
apiClient.interceptors.request.use(
  (config) => {
    if (env.HH_USER_AGENT) {
      config.headers['User-Agent'] = env.HH_USER_AGENT
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
  logger.error('Error occurred:', JSON.stringify(error))

  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.description || error.message
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

// Tools
mcpServer.tool(
  'get-vacancies',
  `Search for vacancies`,
  {
    page: z.number().optional(),
    per_page: z.number().optional(),
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
    salary: z.number().optional(),
    label: z.string().optional(),
    only_with_salary: z.boolean().optional(),
    period: z.number().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    top_lat: z.number().optional(),
    bottom_lat: z.number().optional(),
    left_lng: z.number().optional(),
    right_lng: z.number().optional(),
    order_by: z.string().optional(),
    sort_point_lat: z.number().optional(),
    sort_point_lng: z.number().optional(),
    clusters: z.boolean().optional(),
    describe_arguments: z.boolean().optional(),
    no_magic: z.boolean().optional(),
    premium: z.boolean().optional(),
    responses_count_enabled: z.boolean().optional(),
    part_time: z.string().optional(),
    accept_temporary: z.boolean().optional(),
    employment_form: z.string().optional(),
    work_schedule_by_days: z.string().optional(),
    working_hours: z.string().optional(),
    work_format: z.string().optional(),
    excluded_text: z.string().optional(),
    education: z.string().optional(),
  },
  async (args) => {
    try {
      const response = await apiClient.get('/vacancies', {
        params: args,
      })
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-dictionaries', `Directories of fields`, {}, async (args) => {
  try {
    const response = await apiClient.get('/dictionaries', {
      params: args,
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
    additional_case: z.string().optional(),
  },
  async (args) => {
    try {
      const response = await apiClient.get('/areas', {
        params: args,
      })
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-languages', `The list of all languages`, {}, async (args) => {
  try {
    const response = await apiClient.get('/languages', {
      params: args,
    })
    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-industries', `Industries`, {}, async (args) => {
  try {
    const response = await apiClient.get('/industries', {
      params: args,
    })
    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-metro', `The list of metro stations in all cities`, {}, async (args) => {
  try {
    const response = await apiClient.get('/metro', {
      params: args,
    })
    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-professional-roles', `Professional role directory`, {}, async (args) => {
  try {
    const response = await apiClient.get('/professional_roles', {
      params: args,
    })
    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-employers',
  `Employer search`,
  {
    text: z.string().optional(),
    area: z.string().optional(),
    type: z.string().optional(),
    only_with_vacancies: z.boolean().optional(),
    sort_by: z.enum(['by_name', 'by_vacancies_open']).optional(),
    page: z.number().optional(),
    per_page: z.number().optional(),
  },
  async (args) => {
    try {
      const response = await apiClient.get('/employers', {
        params: args,
      })
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await mcpServer.server.connect(transport)
  logger.log('HeadHunter MCP Server started')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
