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

type EnvConfig = z.infer<typeof envSchema>

// Parse and validate environment variables
const env = envSchema.parse(process.env)

const mcpServer = new McpServer(
  {
    name: '@sargonpiraev/hh-mcp-server',
    version: '0.0.1',
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
  baseURL: '',
  headers: {
    'User-Agent': '',
    Accept: 'application/json',
  },
  timeout: 30000,
})

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

async function main() {
  const transport = new StdioServerTransport()
  await mcpServer.server.connect(transport)
  logger.log('HeadHunter MCP Server started')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
