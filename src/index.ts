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
mcpServer.tool(
  'get-vacancies',
  `Search for vacancies\n\nReturns a list of vacancies that are posted in the service. The vacancy list is filtered in accordance with specified query parameters.\n\nFeatures:\n\n* Unknown parameters and parameters with an error in the name are ignored.\n* If an authorization token is not specified, a captcha will be prompted after the first request.\n* The vacancy list depends on the user authorization type. For example, for applicant authorization the vacancy list is filtered by the [list of hidden vacancies](#tag/Hidden-vacancies) and the [list of hidden companies](#tag/Blacklisted-employers).\n* The vacancy list also depends on a [website selection](#section/General-information/Host-selection) (the \`host\` parameter). However, selection of a regional site, for example hh.kz, does not limit the list with the vacancies of the selected region. To limit the list by a region, use the \`area\` parameter.\n* When indicating paging parameters (\`page\`, \`per_page\`), a restriction takes effect: the number of results returned can not exceed \`2000\`. For instance, a request \`per_page=10&page=199\` (displaying vacancies from \`1991\` to \`2000\`) is possible, but a request with \`per_page=10&page=200\` returns an error (displaying vacancies from \`2001\` to \`2010\`)\n`,
  {
    page: z.number().optional().describe(`Page number`),
    per_page: z.number().optional().describe(`Number of elements`),
    text: z
      .string()
      .optional()
      .describe(
        `Text field. The sent value is searched in the vacancy fields specified in the search_field parameter.\nAs with the main website, a query language is available: https://hh.ru/article/1175. There is [autosuggest](#tag/Suggestions/operation/get-vacancy-search-keywords) especially for this field\n`
      ),
    search_field: z
      .string()
      .optional()
      .describe(
        `An area of search. Directory with possible values: \`vacancy_search_fields\` in [/dictionaries](#tag/Public-directories/operation/get-dictionaries). By default, all fields are used. Several values can be indicated\n`
      ),
    experience: z
      .string()
      .optional()
      .describe(
        `Work experience. Directory with possible values: \`experience\` in [/dictionaries](#tag/Public-directories/operation/get-dictionaries). Several values can be indicated\n`
      ),
    employment: z
      .string()
      .optional()
      .describe(
        `Employment type. Directory with possible values: \`employment\` in [/dictionaries](#tag/Public-directories/operation/get-dictionaries). Several values can be indicated\n`
      ),
    schedule: z
      .string()
      .optional()
      .describe(
        `Work schedule. Directory with possible values: \`schedule\` in [/dictionaries](#tag/Public-directories/operation/get-dictionaries). Several values can be indicated\n`
      ),
    area: z
      .string()
      .optional()
      .describe(
        `A region. Directory with possible values: [/areas](#tag/Public-directories/operation/get-areas). Several values can be indicated\n`
      ),
    metro: z
      .string()
      .optional()
      .describe(
        `A metro line or station. Directory with possible values: [/metro](#tag/Public-directories/operation/get-metro-stations). Several values can be indicated\n`
      ),
    professional_role: z
      .string()
      .optional()
      .describe(
        `A professional role. Directory with possible values: [professional_roles](#tag/Public-directories/operation/get-professional-roles-dictionary). Several values can be indicated\n`
      ),
    industry: z
      .string()
      .optional()
      .describe(
        `An industry of the company that posted the vacancy. Directory with possible values: [/industries](#tag/Public-directories/operation/get-industries). Several values can be indicated\n`
      ),
    employer_id: z
      .string()
      .optional()
      .describe(`A [company](#tag/Employer) identifier. Several values can be indicated\n`),
    currency: z
      .string()
      .optional()
      .describe(
        `A currency code. Directory with possible values: \`currency\` (code key) in [/dictionaries](#tag/Public-directories/operation/get-dictionaries)\n`
      ),
    salary: z
      .number()
      .optional()
      .describe(
        `A salary rate. If this field is indicated, but currency is not, then the RUR value is used for currency\n`
      ),
    label: z
      .string()
      .optional()
      .describe(
        `Filter by vacancy labels. Directory with possible values: \`vacancy_label\` in [/dictionaries](#tag/Public-directories/operation/get-dictionaries). Several values can be indicated\n`
      ),
    only_with_salary: z
      .string()
      .optional()
      .describe(
        `Show only the vacancies with salary specified. Possible values: \`true\`or \`false\`. By default, \`false\` is used\n`
      ),
    period: z.number().optional().describe(`A range of days within which vacancies will be found. Maximal value: 30\n`),
    date_from: z
      .string()
      .optional()
      .describe(
        `A start date which restricts the date range of vacancy posting. You can not indicate it with the period parameter.\nThe value is indicated in the ISO 8601 format — \`YYYY-MM-DD\` or with up-to-the-second precision \`YYYY-MM-DDThh:mm:ss±hhmm\`. The shown value will be rounded down to the nearest five minutes\n`
      ),
    date_to: z
      .string()
      .optional()
      .describe(
        `An end date which restricts the date range of vacancy posting. You must give it only with the date_from parameter. You can not indicate it with the period parameter.\nThe value is indicated in the ISO 8601 format — YYYY-MM-DD or with accuracy in seconds \`YYYY-MM-DDThh:mm:ss±hhmm\`. The shown value will be rounded down to the nearest five minutes\n`
      ),
    top_lat: z
      .number()
      .optional()
      .describe(
        `Top latitude boundary.\nWhen searching, the value of the address indicated in the vacancy is used. The acceptable value is decimal degrees.\nAll the four parameters of geographic coordinates must be given simultaneously, otherwise an error will be returned\n`
      ),
    bottom_lat: z
      .number()
      .optional()
      .describe(
        `Bottom latitude boundary.\nWhen searching, the value of the address indicated in the vacancy is used. The acceptable value is decimal degrees.\nAll the four parameters of geographic coordinates must be given simultaneously, otherwise an error will be returned\n`
      ),
    left_lng: z
      .number()
      .optional()
      .describe(
        `Left longitude boundary.\nWhen searching, the value of the address indicated in the vacancy is used. The acceptable value is decimal degrees.\nAll the four parameters of geographic coordinates must be given simultaneously, otherwise an error will be returned\n`
      ),
    right_lng: z
      .number()
      .optional()
      .describe(
        `Right longitude boundary.\nWhen searching, the value of the address indicated in the vacancy is used. The acceptable value is decimal degrees.\nAll the four parameters of geographic coordinates must be given simultaneously, otherwise an error will be returned\n`
      ),
    order_by: z
      .string()
      .optional()
      .describe(
        `Vacancy list sorting. Directory with possible values: \`vacancy_search_order\` in [/dictionaries](#tag/Public-directories/operation/get-dictionaries). \nIf the sorting by distance from a geo-point is selected, the coordinates of the geo-point must be set: \`sort_point_lat\`, \`sort_point_lng\`\n`
      ),
    sort_point_lat: z
      .number()
      .optional()
      .describe(
        `The value of geographic latitude of the point that is used to sort vacancies by distance. It must be indicated only in case when \`order_by\` is set to \`distance\`\n`
      ),
    sort_point_lng: z
      .number()
      .optional()
      .describe(
        `The value of geographic longitude of the point that is used to sort vacancies by distance. It must be indicated only in case when \`order_by\` is set to \`distance\`\n`
      ),
    clusters: z
      .string()
      .optional()
      .describe(
        `Whether the [clusters for this search](#tag/Vacancy-search/Clusters-of-vacancy-search) are returned. Default: \`false\`\n`
      ),
    describe_arguments: z
      .string()
      .optional()
      .describe(
        `Whether the description of the used search parameters is returned (the \`arguments\` array). Default: \`false\`\n`
      ),
    no_magic: z
      .string()
      .optional()
      .describe(
        `If true — turn off automatic vacancy transformation. Default — \`false\`.\nIf automatic transformation is enabled, an attempt will be made to change the user's text query to a set of parameters. For example, a query \`text=moscow accountant 100500\` will be transformed to \`text=accountant&only_with_salary=true&area=1&salary=100500\`\n`
      ),
    premium: z
      .string()
      .optional()
      .describe(
        `If \`true\`, the results of vacancies take premium vacancies into account. This type of sorting is used on the website. Default — false\n`
      ),
    responses_count_enabled: z
      .string()
      .optional()
      .describe(`If true – include optional field counters with responses on a vacancy. Default – false\n`),
    part_time: z
      .string()
      .optional()
      .describe(
        `Vacancies for part times job. Possible values:\n* All elements from \`working_days\` in [/dictionaries](https://api.hh.ru/openapi/en/redoc#tag/Public-directories/operation/get-dictionaries).\n* All elements from \`working_time_intervals\` in [/dictionaries](https://api.hh.ru/openapi/en/redoc#tag/Public-directories/operation/get-dictionaries).\n* All elements from \`working_time_modes\` in [/dictionaries](https://api.hh.ru/openapi/en/redoc#tag/Public-directories/operation/get-dictionaries).\n* Elements \`part\` or \`project\` from \`employment\` in [/dictionaries](https://api.hh.ru/openapi/en/redoc#tag/Public-directories/operation/get-dictionaries).\n* Element \`accept_temporary\` that show only the vacancies with accept temporary employment\nSeveral values can be indicated\n`
      ),
    accept_temporary: z
      .string()
      .optional()
      .describe(
        `If the value is \`true\`, then the search occurs only for temporary job vacancies.\nDefault is \`false\`\n`
      ),
    employment_form: z
      .string()
      .optional()
      .describe(
        `Тип занятости. Необходимо передавать \`id\` из справочника \`employment_form\` в [/dictionaries](#tag/Obshie-spravochniki/operation/get-dictionaries). Можно указать несколько значений\n`
      ),
    work_schedule_by_days: z
      .string()
      .optional()
      .describe(
        `График работы. Необходимо передавать \`id\` из справочника \`work_schedule_by_days\` в [/dictionaries](#tag/Obshie-spravochniki/operation/get-dictionaries). Можно указать несколько значений\n`
      ),
    working_hours: z
      .string()
      .optional()
      .describe(
        `Рабочие часы в день. Необходимо передавать \`id\` из справочника \`working_hours\` в [/dictionaries](#tag/Obshie-spravochniki/operation/get-dictionaries). Можно указать несколько значений\n`
      ),
    work_format: z
      .string()
      .optional()
      .describe(
        `Формат работы. Необходимо передавать \`id\` из справочника \`work_format\` в [/dictionaries](#tag/Obshie-spravochniki/operation/get-dictionaries). Можно указать несколько значений\n`
      ),
    excluded_text: z
      .string()
      .optional()
      .describe(
        `Исключить слова. Из результата будут исключены вакансии, содержащие слова, переданные в этом параметре. Слова разделяются запятой\n`
      ),
    education: z
      .string()
      .optional()
      .describe(
        `Образование. Можно указать несколько значений. Возможные значения:\n* \`not_required_or_not_specified\` - не требуется или не указано\n* \`special_secondary\` - среднее специальное\n* \`higher\` - высшее\n`
      ),
  },
  async ({
    page,
    per_page,
    text,
    search_field,
    experience,
    employment,
    schedule,
    area,
    metro,
    professional_role,
    industry,
    employer_id,
    currency,
    salary,
    label,
    only_with_salary,
    period,
    date_from,
    date_to,
    top_lat,
    bottom_lat,
    left_lng,
    right_lng,
    order_by,
    sort_point_lat,
    sort_point_lng,
    clusters,
    describe_arguments,
    no_magic,
    premium,
    responses_count_enabled,
    part_time,
    accept_temporary,
    employment_form,
    work_schedule_by_days,
    working_hours,
    work_format,
    excluded_text,
    education,
  }) => {
    try {
      logger.log(
        'get-vacancies called with params:',
        JSON.stringify({
          page,
          per_page,
          text,
          search_field,
          experience,
          employment,
          schedule,
          area,
          metro,
          professional_role,
          industry,
          employer_id,
          currency,
          salary,
          label,
          only_with_salary,
          period,
          date_from,
          date_to,
          top_lat,
          bottom_lat,
          left_lng,
          right_lng,
          order_by,
          sort_point_lat,
          sort_point_lng,
          clusters,
          describe_arguments,
          no_magic,
          premium,
          responses_count_enabled,
          part_time,
          accept_temporary,
          employment_form,
          work_schedule_by_days,
          working_hours,
          work_format,
          excluded_text,
          education,
        })
      )

      const url: string = '/vacancies'

      const queryParams: Record<string, unknown> = {}
      if (page !== undefined) queryParams.page = page
      if (per_page !== undefined) queryParams.per_page = per_page
      if (text !== undefined) queryParams.text = text
      if (search_field !== undefined) queryParams.search_field = search_field
      if (experience !== undefined) queryParams.experience = experience
      if (employment !== undefined) queryParams.employment = employment
      if (schedule !== undefined) queryParams.schedule = schedule
      if (area !== undefined) queryParams.area = area
      if (metro !== undefined) queryParams.metro = metro
      if (professional_role !== undefined) queryParams.professional_role = professional_role
      if (industry !== undefined) queryParams.industry = industry
      if (employer_id !== undefined) queryParams.employer_id = employer_id
      if (currency !== undefined) queryParams.currency = currency
      if (salary !== undefined) queryParams.salary = salary
      if (label !== undefined) queryParams.label = label
      if (only_with_salary !== undefined) queryParams.only_with_salary = only_with_salary
      if (period !== undefined) queryParams.period = period
      if (date_from !== undefined) queryParams.date_from = date_from
      if (date_to !== undefined) queryParams.date_to = date_to
      if (top_lat !== undefined) queryParams.top_lat = top_lat
      if (bottom_lat !== undefined) queryParams.bottom_lat = bottom_lat
      if (left_lng !== undefined) queryParams.left_lng = left_lng
      if (right_lng !== undefined) queryParams.right_lng = right_lng
      if (order_by !== undefined) queryParams.order_by = order_by
      if (sort_point_lat !== undefined) queryParams.sort_point_lat = sort_point_lat
      if (sort_point_lng !== undefined) queryParams.sort_point_lng = sort_point_lng
      if (clusters !== undefined) queryParams.clusters = clusters
      if (describe_arguments !== undefined) queryParams.describe_arguments = describe_arguments
      if (no_magic !== undefined) queryParams.no_magic = no_magic
      if (premium !== undefined) queryParams.premium = premium
      if (responses_count_enabled !== undefined) queryParams.responses_count_enabled = responses_count_enabled
      if (part_time !== undefined) queryParams.part_time = part_time
      if (accept_temporary !== undefined) queryParams.accept_temporary = accept_temporary
      if (employment_form !== undefined) queryParams.employment_form = employment_form
      if (work_schedule_by_days !== undefined) queryParams.work_schedule_by_days = work_schedule_by_days
      if (working_hours !== undefined) queryParams.working_hours = working_hours
      if (work_format !== undefined) queryParams.work_format = work_format
      if (excluded_text !== undefined) queryParams.excluded_text = excluded_text
      if (education !== undefined) queryParams.education = education

      const response = await apiClient.get(url, { params: queryParams })

      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-dictionaries',
  `Directories of fields\n\nDirectories of fields and entities used in API. The values in the directories may change at any time`,
  {},
  async () => {
    try {
      logger.log('get-dictionaries called with params:', JSON.stringify({}))

      const url: string = '/dictionaries'

      const response = await apiClient.get(url)

      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-areas',
  `Tree view of all regions\n\nReturns a tree view list of all regions.\n\nThe values in the directories may change at any time\n`,
  {
    additional_case: z
      .string()
      .optional()
      .describe(
        `Applicable only to Russian localization.\n\nThe area name returns in additional field in a specified case. Only \`prepositional\` case is available\n`
      ),
  },
  async ({ additional_case }) => {
    try {
      logger.log('get-areas called with params:', JSON.stringify({ additional_case }))

      const url: string = '/areas'

      const queryParams: Record<string, unknown> = {}
      if (additional_case !== undefined) queryParams.additional_case = additional_case

      const response = await apiClient.get(url, { params: queryParams })

      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-languages', `The list of all languages\n\nThe list of all languages`, {}, async () => {
  try {
    logger.log('get-languages called with params:', JSON.stringify({}))

    const url: string = '/languages'

    const response = await apiClient.get(url)

    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] }
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('get-industries', `Industries\n\nReturns two-level directory of all industries`, {}, async () => {
  try {
    logger.log('get-industries called with params:', JSON.stringify({}))

    const url: string = '/industries'

    const response = await apiClient.get(url)

    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] }
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-metro-stations',
  `The list of metro stations in all cities\n\nThe list of metro stations in all cities`,
  {},
  async () => {
    try {
      logger.log('get-metro-stations called with params:', JSON.stringify({}))

      const url: string = '/metro'

      const response = await apiClient.get(url)

      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-professional-roles-dictionary',
  `Professional role directory\n\nReturns professional roles, their categories and other information about professional roles\n`,
  {},
  async () => {
    try {
      logger.log('get-professional-roles-dictionary called with params:', JSON.stringify({}))

      const url: string = '/professional_roles'

      const response = await apiClient.get(url)

      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] }
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'search-employer',
  `Employer search\n\nFor page parameters (\`page\`, \`per_page\`) there is a limit: the depth of returned results cannot exceed \`5000\`. For example, a request \`per_page=10&page=499\` (search results from \`4991\` to \`5000\` employers) is possible, but a request with \`per_page=10&page=500\` returns an error (results from 5001 to 5010 employers)`,
  {
    text: z
      .string()
      .optional()
      .describe(`Text field. Sent value is searched in the name and description of the employer`),
    area: z
      .string()
      .optional()
      .describe(
        `Employer region ID, multiple parameter. You can find region ID in the [directory of regions](#tag/Public-directories/operation/get-areas)`
      ),
    type: z
      .string()
      .optional()
      .describe(
        `Type of the employer, multiple parameter. Allowed values are listed in the [directory](#tag/Public-directories/operation/get-dictionaries) in the \`employer_type\` field`
      ),
    only_with_vacancies: z
      .string()
      .optional()
      .describe(
        `Whether query returns only employers who have open vacancies at the moment (\`true\`) or all employers (\`false\`). Default — \`false\``
      ),
    sort_by: z
      .string()
      .optional()
      .describe(
        `Sort by name (\`by_name\`) or by opened vacancies count (\`by_vacancies_open\`). Default — \`by_name\``
      ),
    page: z.number().optional().describe(`Number of page with employers (counted up from 0, default is 0)`),
    per_page: z.number().optional().describe(`Number of elements on a page (default — 20, max value — 100)`),
  },
  async ({ text, area, type, only_with_vacancies, sort_by, page, per_page }) => {
    try {
      logger.log(
        'search-employer called with params:',
        JSON.stringify({ text, area, type, only_with_vacancies, sort_by, page, per_page })
      )

      const url: string = '/employers'

      const queryParams: Record<string, unknown> = {}
      if (text !== undefined) queryParams.text = text
      if (area !== undefined) queryParams.area = area
      if (type !== undefined) queryParams.type = type
      if (only_with_vacancies !== undefined) queryParams.only_with_vacancies = only_with_vacancies
      if (sort_by !== undefined) queryParams.sort_by = sort_by
      if (page !== undefined) queryParams.page = page
      if (per_page !== undefined) queryParams.per_page = per_page

      const response = await apiClient.get(url, { params: queryParams })

      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] }
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
