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
    mcpServer.server.sendLoggingMessage({
      level: 'info',
      data: message.join(' '),
    }),
  error: (...message: (string | object)[]) =>
    mcpServer.server.sendLoggingMessage({
      level: 'error',
      data: message.join(' '),
    }),
  debug: (...message: (string | object)[]) =>
    mcpServer.server.sendLoggingMessage({
      level: 'debug',
      data: message.join(' '),
    }),
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

function handleError(error: unknown) {
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
mcpServer.tool('get-vacancies', `Search for vacancies`, {}, async (args) => {
  try {
    const response = await apiClient.get('/vacancies', {
      params: args,
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    }
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-dictionaries', `Directories of fields`, {}, async (args) => {
  try {
    const response = await apiClient.get('/dictionaries', {
      params: args,
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    }
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-areas', `Tree view of all regions`, {}, async (args) => {
  try {
    const response = await apiClient.get('/areas', {
      params: args,
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    }
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-languages', `The list of all languages`, {}, async (args) => {
  try {
    const response = await apiClient.get('/languages', {
      params: args,
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    }
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-industries', `Industries`, {}, async (args) => {
  try {
    const response = await apiClient.get('/industries', {
      params: args,
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    }
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-metro', `The list of metro stations in all cities`, {}, async (args) => {
  try {
    const response = await apiClient.get('/metro', {
      params: args,
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    }
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-professional-roles', `Professional role directory`, {}, async (args) => {
  try {
    const response = await apiClient.get('/professional_roles', {
      params: args,
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    }
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-employers', `Employer search`, {}, async (args) => {
  try {
    const response = await apiClient.get('/employers', {
      params: args,
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    }
  } catch (error) {
    return handleError(error)
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await mcpServer.server.connect(transport)
  logger.log('HeadHunter MCP Server started')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
