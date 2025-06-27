#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  createHeadHunterClient,
  getCurrentUserInfo,
  getMineResumes,
  getResume,
  getNegotiations,
  getNegotiationItem,
  sendNegotiationMessage,
  applyToVacancy,
  getFavoriteVacancies,
  addVacancyToFavorite,
  deleteVacancyFromFavorite,
  getVacanciesSimilarToResume,
  getVacancies,
  getVacancy,
} from '@sargonpiraev/hh-api-client'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

dotenv.config()

const mcpServer = new McpServer(
  {
    name: 'HeadHunter MCP Server for Job Seekers',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
    instructions: `
      This is a MCP server for the HeadHunter API focused on job seeker functionality.
      It allows authenticated users to manage their HeadHunter profile, resumes, and job applications.
      
      The server provides tools for:
      - User profile management
      - Resume management (view)
      - Job application management (negotiations)
      - Vacancy search and favorites
      - Application tracking
      
      Required environment variables:
      - HH_ACCESS_TOKEN: HeadHunter OAuth access token for the user
      - HH_USER_AGENT: User agent string (format: AppName/Version contact@email.com)
      
      HeadHunter API documentation: https://dev.hh.ru/
    `,
  }
)

const envSchema = z.object({
  HH_ACCESS_TOKEN: z.string().min(1).describe('HeadHunter OAuth access token'),
  HH_USER_AGENT: z.string().min(1).describe('User agent string for API requests'),
})

const env = envSchema.parse(process.env)

const logger = {
  log: (...message: (string | object)[]) =>
    mcpServer.server.sendLoggingMessage({ level: 'info', data: message.join(' ') }),
  error: (...message: (string | object)[]) =>
    mcpServer.server.sendLoggingMessage({ level: 'error', data: message.join(' ') }),
  debug: (...message: (string | object)[]) =>
    mcpServer.server.sendLoggingMessage({ level: 'debug', data: message.join(' ') }),
}

// Create authenticated HeadHunter client
const hhClient = createHeadHunterClient({
  userAgent: env.HH_USER_AGENT,
  accessToken: env.HH_ACCESS_TOKEN,
})

// Common headers for authenticated requests
const getHeaders = () => ({
  'HH-User-Agent': env.HH_USER_AGENT,
  'Authorization': `Bearer ${env.HH_ACCESS_TOKEN}`,
})

function handleError(error: unknown) {
  console.error(error)
  logger.error('Error occurred:', JSON.stringify(error))
  
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { description?: string } }; message?: string }
    const message = axiosError.response?.data?.description || axiosError.message
    return { 
      isError: true, 
      content: [{ type: 'text', text: `HeadHunter API Error: ${message}` }] 
    } as CallToolResult
  }
  
  return { 
    isError: true, 
    content: [{ type: 'text', text: `Error: ${error}` }] 
  } as CallToolResult
}

// ===== USER PROFILE MANAGEMENT =====

mcpServer.tool(
  'get-current-user-info',
  `
    Get information about the current authenticated user.
    Returns user profile data including personal information, contact details, and account settings.
  `,
  {},
  async () => {
    try {
      logger.log('Getting current user info')
      const result = await getCurrentUserInfo({ 
        client: hhClient,
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

// ===== RESUME MANAGEMENT =====

mcpServer.tool(
  'get-my-resumes',
  `
    Get list of user's resumes.
    Returns all resumes belonging to the authenticated user.
  `,
  {},
  async () => {
    try {
      logger.log('Getting user resumes')
      const result = await getMineResumes({ 
        client: hhClient,
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-resume',
  `
    Get detailed information about a specific resume.
    Returns full resume data including experience, education, skills, etc.
  `,
  {
    resume_id: z.string().describe('Resume ID'),
  },
  async ({ resume_id }) => {
    try {
      logger.log(`Getting resume ${resume_id}`)
      const result = await getResume({ 
        client: hhClient,
        path: { resume_id },
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

// ===== NEGOTIATIONS MANAGEMENT =====

mcpServer.tool(
  'get-negotiations',
  `
    Get list of negotiations (job applications and responses).
    Returns all negotiations for the authenticated user with optional filtering.
  `,
  {
    page: z.number().min(0).optional().describe('Page number (default: 0)'),
    per_page: z.number().min(1).max(100).optional().describe('Items per page (default: 20)'),
    order_by: z.enum(['created_at', 'updated_at']).optional().describe('Sort order'),
    order_dir: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
  },
  async (params) => {
    try {
      logger.log('Getting negotiations with params:', JSON.stringify(params))
      const result = await getNegotiations({ 
        client: hhClient,
        query: params,
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-negotiation',
  `
    Get detailed information about a specific negotiation.
    Returns full negotiation data including messages and current status.
  `,
  {
    negotiation_id: z.string().describe('Negotiation ID'),
  },
  async ({ negotiation_id }) => {
    try {
      logger.log(`Getting negotiation ${negotiation_id}`)
      const result = await getNegotiationItem({ 
        client: hhClient,
        path: { id: negotiation_id },
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'send-negotiation-message',
  `
    Send a message in a negotiation.
    Allows sending messages to employers in active negotiations.
  `,
  {
    negotiation_id: z.string().describe('Negotiation ID'),
    message: z.string().describe('Message text to send'),
  },
  async ({ negotiation_id, message }) => {
    try {
      logger.log(`Sending message to negotiation ${negotiation_id}`)
      await sendNegotiationMessage({ 
        client: hhClient,
        path: { nid: negotiation_id },
        body: { message },
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: 'Message sent successfully' }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

// ===== VACANCY APPLICATION =====

mcpServer.tool(
  'apply-to-vacancy',
  `
    Apply to a job vacancy.
    Submit an application to a specific vacancy using one of your resumes.
  `,
  {
    vacancy_id: z.string().describe('Vacancy ID to apply to'),
    resume_id: z.string().describe('Resume ID to use for application'),
    message: z.string().optional().describe('Cover letter message'),
  },
  async ({ vacancy_id, resume_id, message }) => {
    try {
      logger.log(`Applying to vacancy ${vacancy_id} with resume ${resume_id}`)
      await applyToVacancy({ 
        client: hhClient,
        body: { 
          vacancy_id,
          resume_id,
          message: message || ''
        },
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: 'Application submitted successfully' }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

// ===== VACANCY SEARCH AND FAVORITES =====

mcpServer.tool(
  'search-vacancies',
  `
    Search for job vacancies.
    Search vacancies with various filters including salary, experience, location, etc.
  `,
  {
    text: z.string().optional().describe('Search query text'),
    area: z.string().optional().describe('Area ID for location filtering (e.g. "1" for Moscow)'),
    salary: z.number().optional().describe('Minimum salary amount'),
    currency: z.string().optional().describe('Currency code (default: RUR)'),
    only_with_salary: z.boolean().optional().describe('Show only vacancies with salary'),
    experience: z.string().optional().describe('Experience level (noExperience, between1And3, between3And6, moreThan6)'),
    employment: z.string().optional().describe('Employment type (full, part, project, volunteer, probation)'),
    schedule: z.string().optional().describe('Work schedule (fullDay, shift, flexible, remote, flyInFlyOut)'),
    page: z.number().min(0).max(99).optional().describe('Page number (0-99, default: 0)'),
    per_page: z.number().min(1).max(100).optional().describe('Items per page (1-100, default: 20)'),
  },
  async (params) => {
    try {
      logger.log('Searching vacancies with params:', JSON.stringify(params))
      const result = await getVacancies({ 
        client: hhClient,
        query: params,
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancy',
  `
    Get detailed information about a specific vacancy.
    Returns full vacancy details including description, requirements, and company information.
  `,
  {
    vacancy_id: z.string().describe('Vacancy ID'),
  },
  async ({ vacancy_id }) => {
    try {
      logger.log(`Getting vacancy ${vacancy_id}`)
      const result = await getVacancy({ 
        client: hhClient,
        path: { vacancy_id },
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-favorite-vacancies',
  `
    Get list of favorite vacancies.
    Returns all vacancies saved to favorites by the user.
  `,
  {},
  async () => {
    try {
      logger.log('Getting favorite vacancies')
      const result = await getFavoriteVacancies({ 
        client: hhClient,
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-vacancy-to-favorites',
  `
    Add a vacancy to favorites.
    Save a vacancy to your favorites list for later reference.
  `,
  {
    vacancy_id: z.string().describe('Vacancy ID to add to favorites'),
  },
  async ({ vacancy_id }) => {
    try {
      logger.log(`Adding vacancy ${vacancy_id} to favorites`)
      await addVacancyToFavorite({ 
        client: hhClient,
        path: { vacancy_id },
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: 'Vacancy added to favorites successfully' }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'remove-vacancy-from-favorites',
  `
    Remove a vacancy from favorites.
    Remove a previously saved vacancy from your favorites list.
  `,
  {
    vacancy_id: z.string().describe('Vacancy ID to remove from favorites'),
  },
  async ({ vacancy_id }) => {
    try {
      logger.log(`Removing vacancy ${vacancy_id} from favorites`)
      await deleteVacancyFromFavorite({ 
        client: hhClient,
        path: { vacancy_id },
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: 'Vacancy removed from favorites successfully' }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-vacancies-similar-to-resume',
  `
    Get vacancies similar to a specific resume.
    Find job opportunities that match a resume's skills and experience.
  `,
  {
    resume_id: z.string().describe('Resume ID to find similar vacancies for'),
    page: z.number().min(0).optional().describe('Page number (default: 0)'),
    per_page: z.number().min(1).max(100).optional().describe('Items per page (default: 20)'),
  },
  async ({ resume_id, page = 0, per_page = 20 }) => {
    try {
      logger.log(`Getting vacancies similar to resume ${resume_id}`)
      const result = await getVacanciesSimilarToResume({ 
        client: hhClient,
        path: { resume_id },
        query: { page, per_page },
        headers: getHeaders()
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await mcpServer.server.connect(transport)
  logger.log('HeadHunter MCP Server for Job Seekers started')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
