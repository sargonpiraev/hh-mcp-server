#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

dotenv.config()

const envSchema = z.object({
  HH_API_TOKEN: z.string(),
})

const env = envSchema.parse(process.env)

const mcpServer = new McpServer(
  {
    name: '@sargonpiraev/hh-mcp-server',
    version: '',
  },
  {
    instructions: `In English | [По-русски](https://api.hh.ru/openapi/redoc)

Documentation [in GitHub](https://github.com/hhru/api/blob/master/docs_eng/README.md).

You can use Ctrl+F to search through the documentation.

# General information
  
* The whole API works using the HTTPS protocol.
* Authorization is performed via the OAuth2 protocol.
* All data is available only in the JSON format.
* The basic URL is &#x60;https://api.hh.ru/&#x60;
* Requests for [any site of HeadHunter Groups of Companies](#section/General-information/Host-selection)
are available
* &lt;a name&#x3D;&quot;date-format&quot;&gt;&lt;/a&gt; Dates are formatted according to
[ISO 8601](http://en.wikipedia.org/wiki/ISO_8601): &#x60;YYYY-MM-DDThh:mm:ss±hhmm&#x60;.
  
  
  ## Request requirements
  
  Your request should send the &#x60;User-Agent&#x60; header, but if your
  HTTP client does not allow it, you can send an &#x60;HH-User-Agent&#x60; header. If no header is sent,
  you will receive the &#x60;400 Bad Request&#x60; as a response.
  By specifying the name of the application and the developer&#x27;s contact email in the header,
  you will help us to contact you promptly if required.
  The &#x60;User-Agent&#x60; and &#x60;HH-User-Agent&#x60; headers are interchangeable. If you send both headers,
  only &#x60;HH-User-Agent&#x60; is processed.
  
  &#x60;&#x60;&#x60;
User-Agent: MyApp/1.0 (my-app-feedback@example.com)
  &#x60;&#x60;&#x60;
  
  More detail on [errors in the User-Agent title](https://github.com/hhru/api/blob/master/docs_eng/errors.md#user-agent).
  
  
### Request body format when sending JSON

Data transferred in the request body must meet the requirements:
  
  * Valid JSON (it is acceptable to transfer both minified and
  pretty-printed variants with extra whitespace and line breaks).
  
  * It is recommended to use the UTF-8 encoding without extra escaping
(&#x60;{&quot;name&quot;: &quot;Иванов Иван&quot;}&#x60;).
  
  * It is also possible to use the ascii encoding with escaping
(&#x60;{&quot;name&quot;: &quot;\u0418\u0432\u0430\u043d\u043e\u0432 \u0418\u0432\u0430\u043d&quot;}&#x60;).
  
  * Data types in certain fields are supplemented with additional conditions
  described in each specific method. In JSON, data types are &#x60;string&#x60;, &#x60;number&#x60;,
  &#x60;boolean&#x60;, &#x60;null&#x60;, &#x60;object&#x60;, &#x60;array&#x60;.
  
  ### Response
  A response that exceeds a certain length will be compressed using gzip.
  
  ### Errors and response codes
  
  API extensively uses informing through response codes.
  The application must process them correctly.
  
  In case of failure or breakdown, responses with the &#x60;503&#x60; and &#x60;500&#x60; code may be
  returned.
  
  When an error occurs, the response body, besides the response code,
  may have additional information allowing the developer
  to learn the cause of a particular response.
  
  [More detail on possible errors](https://github.com/hhru/api/blob/master/docs_eng/errors.md).
  
  
  ## Undocumented fields and request parameters
  
  In responses and API parameters you can find keys that are not described in the
  documentation. It usually means that they are left for compatibility with older
  versions. It is not recommended to use them. If your application already uses
  such keys, switch to using desirable keys described in the documentation.
  
  
  ## Pagination
  
  For every request that presupposes the return of object list you can indicate
  &#x60;page&#x3D;N&amp;per_page&#x3D;M&#x60; in the parameters. Numeration starts from zero; the first
  (zero) page is returned by default with 20 objects on it. In all responses where
pagination is available, the uniform root object:
  
  &#x60;&#x60;&#x60;json
  {
    &quot;found&quot;: 1,
    &quot;per_page&quot;: 1,
    &quot;pages&quot;: 1,
    &quot;page&quot;: 0,
    &quot;items&quot;: [{}]
  }
  &#x60;&#x60;&#x60;
  
  ## Host selection
      
  HeadHunter API allows you to obtain data from all of the HeadHunter group of
  companies websites.
    
  In particular:

  * hh.ru
  * rabota.by
  * hh1.az
  * hh.uz
  * hh.kz
  * headhunter.ge
  * headhunter.kg
      
  Requests for data on all the websites should be made to &#x60;https://api.hh.ru/&#x60;.
      
  If you need to track the specific websites, you can add &#x60;?host&#x3D;&#x60; parameter to
      your request. Default is &#x60;hh.ru&#x60;.
    
  Example: to obtain [localizations](https://api.hh.ru/openapi/en/redoc#tag/Public-directories/operation/get-locales) available on hh.kz, you should
      make a GET-request to &#x60;https://api.hh.ru/locales?host&#x3D;hh.kz&#x60;.
  
  ## CORS (Cross-Origin Resource Sharing)
  
  API supports the CORS technology for requesting browser data from any domain.
  This method is preferable to JSONP. It is not restricted to the GET method. To
  debug CORS, a [special method](https://github.com/hhru/api/blob/master/docs_eng/cors.md) is available. To use JSONP, transfer the
  &#x60;?callback&#x3D;callback_name&#x60; parameter.
  
  * [CORS specification on w3.org](http://www.w3.org/TR/cors/)
  * [HTML5Rocks CORS Tutorial](http://www.html5rocks.com/en/tutorials/cors/)
  * [CORS on dev.opera.com](http://dev.opera.com/articles/view/dom-access-control-using-cross-origin-resource-sharing/)
  * [CORS on caniuse.com](http://caniuse.com/#feat&#x3D;cors)
  * [CORS on en.wikipedia.org](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
  
  
## External links to articles and standards
  
* [HTTP/1.1](http://tools.ietf.org/html/rfc2616)
* [JSON](http://json.org/)
* [URI Template](http://tools.ietf.org/html/rfc6570)
* [OAuth 2.0](http://tools.ietf.org/html/rfc6749)
* [REST](http://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
* [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601)

# Authorization

The API supports the following authorization levels:
  - [application authorization](#tag/Application-authorization)
  - [user authorization](#section/Authorization/User-authorization)

* [Obtaining user authorization](#section/Authorization/User-authorization)
  * [Rules for generating special &#x60;redirect_uri&#x60;](#section/Authorization/Rules-for-generating-special-redirect_uri)
  * [Authorization process](#section/Authorization/Authorization-process)
  * [Successful obtaining temporary &#x60;authorization_code&#x60;](#get-authorization_code)
  * [Obtaining access and refresh tokens](#section/Authorization/Obtaining-access-and-refresh-tokens)
* [Updating a pair of access and refresh tokens](#section/Authorization/Updating-a-pair-of-access-and-refresh-tokens)
* [Authorization request under another user](#section/Authorization/Authorization-request-under-another-user)
* [Authorization under different working account](#section/Authorization/Authorization-under-different-working-account)
* [Obtaining application authorization](#tag/Application-authorization)


## User authorization
To make requests as a user you need a user token.

Assign a user to the application (open the page) via the request:

&#x60;&#x60;&#x60;
https://hh.ru/oauth/authorize?
response_type&#x3D;code&amp;
client_id&#x3D;{client_id}&amp;
state&#x3D;{state}&amp;
redirect_uri&#x3D;{redirect_uri}
&#x60;&#x60;&#x60;

Required parameters:

* &#x60;response_type&#x3D;code&#x60; — specifies authorization method using the &#x60;authorization code&#x60;
* &#x60;client_id&#x60; — ID obtained when creating the application


Optional parameters:

* &#x60;state&#x60; — if specified, it will be added in the redirect link of the response. 

  It allows to prevent cross-site request forgery. More info see in [RFC 6749. Section 10.12](http://tools.ietf.org/html/rfc6749#section-10.12)
* &#x60;redirect_uri&#x60; — a URI for redirecting user after authorization. 

  If not specified, the value from the application settings is used. If the value is specified, its validation is carried out. Probably, you will need to make &#x60;urlencode&#x60; of the value.

## Rules for generating special redirect_uri

For example, if &#x60;http://example.com/oauth&#x60; is saved in the settings, it is allowed to specify:

* &#x60;http://www.example.com/oauth&#x60; — a subdomain;
* &#x60;http://www.example.com/oauth/sub/path&#x60; — a detailed path;
* &#x60;http://example.com/oauth?lang&#x3D;RU&#x60; — an additional parameter;
* &#x60;http://www.example.com/oauth/sub/path?lang&#x3D;RU&#x60; — all the mentioned.

Forbidden:

* &#x60;https://example.com/oauth&#x60; — another protocols;
* &#x60;http://wwwexample.com/oauth&#x60; — another domains;
* &#x60;http://wwwexample.com/&#x60; — another paths;
* &#x60;http://example.com/oauths&#x60; — another paths;
* &#x60;http://example.com:80/oauths&#x60; — originally missing port.

## Authorization process

If the user is not authorized, the site login form appears. When the authorization is done, the form with subject access request is shown.

If the user rejects the access request, it triggers the redirection on the specified &#x60;redirect_uri&#x60; with &#x60;?error&#x3D;access_denied&#x60; and
&#x60;state&#x3D;{state}&#x60;, if any.

&lt;a name&#x3D;&quot;get-authorization_code&quot;&gt;&lt;/a&gt;
### Successful obtaining temporary &#x60;authorization_code&#x60;

If the user accepts the access request, the redirect link contains a temporary &#x60;authorization_code&#x60;:

&#x60;&#x60;&#x60;http
HTTP/1.1 302 FOUND
Location: {redirect_uri}?code&#x3D;{authorization_code}
&#x60;&#x60;&#x60;

If the user is already authorized, and the access to the application was granted earlier, then the login and subject access request are omitted, and the above redirect link returns as a response.

## Obtaining access and refresh tokens

After obtaining the &#x60;authorization_code&#x60; the application makes a server-server request &#x60;POST https://api.hh.ru/token&#x60; to exchange the &#x60;authorization_code&#x60; to an &#x60;access_token&#x60; (old &#x60;POST https://hh.ru/oauth/token&#x60; request should consider as deprecated).

The request body should contain [additional parameters](#required_parameters).

The request body should be sent in standard &#x60;application/x-www-form-urlencoded&#x60; format with the corresponding &#x60;Content-Type&#x60; header.

The &#x60;authorization_code&#x60; has a short lifetime. When it expires, request another &#x60;authorization_code&#x60;.

## Updating a pair of access and refresh tokens
The &#x60;access_token&#x60; also has a lifetime (&#x60;expires_in&#x60; parameter, in seconds). When it expires, the application should make a request with the &#x60;refresh_token&#x60; to obtain a new one.

The request should be done in &#x60;application/x-www-form-urlencoded&#x60; format.

&#x60;&#x60;&#x60;
POST https://api.hh.ru/token
&#x60;&#x60;&#x60;

(old &#x60;POST https://hh.ru/oauth/token&#x60; request should consider as deprecated)

The request body should contain [additional parameters](#required_parameters).

You can use the &#x60;refresh_token&#x60; only once and only after expiration of the &#x60;access_token&#x60;.

A new pair of access and refresh tokens should be used for further API requests and requests for token prolongation.

## Authorization request under another user

The following case is possible:

1. Application redirects a user to the site with the authorization request.
2. The user is already authorized on site and application already has an access granted.
3. The user will be proposed to continue the work under current account or login to another one.

If you need to replace step 3 by instant redirection with temporary token, you should add the parameter &#x60;skip_choose_account&#x3D;true&#x60; to &#x60;/oauth/authorize...&#x60; request. Then the authorized user gets access immediately.

If you need to show the authorization form every time, you should add the parameter &#x60;force_login&#x3D;true&#x60; to &#x60;/oauth/authorize...&#x60; request. In this case the authorization form appears even if the user is already authorized.

This feature may be useful for applications that provide services for applicants only. If an employer user tries to log in, the application may propose them to get access under another user.

Also, after the authorization the application can show a message:

&#x60;&#x60;&#x60;
You logged in as %FirstName_LastName%. Is it not you?
&#x60;&#x60;&#x60;
and propose a link with &#x60;force_login&#x3D;true&#x60; for authorization under another login.

## Authorization under different working account

To obtain information about getting a list of manager working accounts and working under different working accounts, see the [manager working account](#tag/Employer-managers/operation/get-manager-accounts) section.


&lt;!-- ReDoc-Inject: &lt;security-definitions&gt; --&gt;
`,
    capabilities: {
      tools: {},
      logging: {},
    },
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

const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.hh.ru',
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config) => {
    if (env.HH_API_TOKEN) {
      config.headers['Authorization'] = env.HH_API_TOKEN
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

mcpServer.tool('confirm-phone-in-resume', `Verify phone with a code`, {}, async (args) => {
  try {
    const response = await apiClient.post('/resume_phone_confirm', args)
    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

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

      const response = await apiClient.get(url, {
        params: queryParams,
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

      const response = await apiClient.get(url, {
        params: queryParams,
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

      const response = await apiClient.get(url, {
        params: queryParams,
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

      const response = await apiClient.get(url, {
        params: queryParams,
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

      const response = await apiClient.post(url, requestData)
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

      const response = await apiClient.get(url, {
        params: queryParams,
      })
      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-manager-accounts', `Manager&#x27;s work accounts`, {}, async (args) => {
  try {
    const response = await apiClient.get('/manager_accounts/mine', {
      params: args,
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
  async (args) => {
    try {
      const response = await apiClient.get('/resume_should_send_sms', {
        params: args,
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

      const response = await apiClient.get(url, {
        params: queryParams,
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
  logger.log('HeadHunter API MCP Server started')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
