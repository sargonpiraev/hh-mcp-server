#!/usr/bin/env node

import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { z } from 'zod'
import { mcpServer, envSchema as baseEnvSchema } from './server.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js'

// Extend Express Request type to include user info
declare module 'express-serve-static-core' {
  interface Request {
    user?: Record<string, unknown>
  }
}

const envSchema = baseEnvSchema.extend({
  PORT: z.string().optional().default('3000'),
  HOST: z.string().optional().default('localhost'),
  HH_CLIENT_ID: z.string(),
  HH_CLIENT_SECRET: z.string(),
  HH_USER_AGENT: z.string(),
  HH_REDIRECT_URI: z.string(),
})

const env = envSchema.parse(process.env)

const app = express()
const sessions = new Map<string, Record<string, unknown>>()
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {}

// Enable CORS for all routes and expose MCP session header
app.use(
  cors({
    origin: '*', // Allow all origins
    exposedHeaders: ['Mcp-Session-Id'],
  })
)

app.use(express.json({ limit: '10mb' }))

const logger = {
  log: (...message: (string | object)[]) => {
    console.log('[MCP]', ...message)
  },
  error: (...message: (string | object)[]) => {
    console.error('[MCP ERROR]', ...message)
  },
  debug: (...message: (string | object)[]) => {
    console.log('[MCP DEBUG]', ...message)
  },
}

// OAuth 2.0 Protected Resource Metadata endpoint
app.get('/.well-known/oauth-protected-resource', (req, res) => {
  const baseUrl = `http://${env.HOST}:${env.PORT}`

  res.json({
    resource: baseUrl,
    authorization_servers: [baseUrl], // This MCP server provides authorization server metadata
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    bearer_methods_supported: ['header'],
    // Note: HeadHunter does not support dynamic client registration
    // resource_registration_endpoint is omitted to indicate this
  })
})

// OAuth 2.0 Authorization Server Metadata endpoint - HeadHunter doesn't provide this, so we create it
app.get('/.well-known/oauth-authorization-server', (req, res) => {
  const baseUrl = `http://${env.HOST}:${env.PORT}`

  res.json({
    issuer: baseUrl, // This MCP server IS the authorization server now
    authorization_endpoint: `${baseUrl}/oauth/authorize`, // Our facade endpoint
    token_endpoint: `${baseUrl}/oauth/token`, // Our facade endpoint
    registration_endpoint: `${baseUrl}/oauth/register`,
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: [],
    // This is now a real OAuth Authorization Server, not just metadata
  })
})

// JWKS endpoint - HeadHunter doesn't provide this, return empty keys for now
app.get('/.well-known/jwks.json', (req, res) => {
  res.json({
    keys: [],
  })
})

// OAuth 2.0 Dynamic Client Registration endpoint (HeadHunter compatibility)
app.post('/oauth/register', (req, res) => {
  try {
    const {
      client_name,
      grant_types = ['authorization_code'],
      response_types = ['code'],
      redirect_uris,
      scope = '',
    } = req.body

    // Validate required fields
    if (!client_name) {
      return res.status(400).json({
        error: 'invalid_client_metadata',
        error_description: 'client_name is required',
      })
    }

    if (!redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      return res.status(400).json({
        error: 'invalid_redirect_uri',
        error_description: 'redirect_uris is required and must be a non-empty array',
      })
    }

    // Check if OAuth credentials are configured
    if (!env.HH_CLIENT_ID) {
      return res.status(503).json({
        error: 'oauth_not_configured',
        error_description:
          'OAuth client credentials not configured. Set HH_CLIENT_ID and HH_CLIENT_SECRET environment variables.',
      })
    }

    // Return pre-configured OAuth client credentials
    // This simulates DCR but actually uses static credentials
    const client_id = env.HH_CLIENT_ID

    logger.log(`DCR facade: Accepting any redirect_uri for "${client_name}"`)

    // Return successful registration response - now we accept ANY redirect_uri
    res.json({
      client_id,
      client_name,
      grant_types,
      response_types,
      redirect_uris, // Accept client's redirect_uris as-is (facade supports any URI)
      scope,
      token_endpoint_auth_method: 'client_secret_basic',
      client_id_issued_at: Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    logger.error('DCR simulation error:', error instanceof Error ? error.message : String(error))
    res.status(400).json({
      error: 'invalid_request',
      error_description: 'Invalid client registration request',
    })
  }
})

// OAuth Client Configuration endpoint for MCP Inspector
app.get('/.well-known/oauth-client-config', (req, res) => {
  if (!env.HH_CLIENT_ID) {
    return res.status(503).json({
      error: 'oauth_not_configured',
      error_description: 'OAuth client ID not configured. Set HH_CLIENT_ID environment variable.',
    })
  }

  const baseUrl = `http://${env.HOST}:${env.PORT}`

  res.json({
    client_id: env.HH_CLIENT_ID,
    authorization_endpoint: `${baseUrl}/oauth/authorize`, // Our facade endpoint
    token_endpoint: `${baseUrl}/oauth/token`, // Our facade endpoint
    scope: '', // OAuth server doesn't use explicit scopes
    response_type: 'code',
    redirect_uri: env.HH_REDIRECT_URI || 'http://localhost:6274/oauth/callback/debug', // Configurable redirect URI
    code_challenge_method: 'S256', // PKCE for security
  })
})

// Facade OAuth Authorization endpoint - accepts any redirect_uri and delegates to HeadHunter
app.get('/oauth/authorize', (req, res) => {
  const { client_id, redirect_uri, state, code_challenge, code_challenge_method = 'S256' } = req.query

  // Validate required parameters
  if (!client_id || !redirect_uri) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'client_id and redirect_uri are required',
    })
  }

  // Store original request parameters for later use in callback
  const stateKey = `auth_${crypto.randomUUID()}`
  sessions.set(stateKey, {
    originalRedirectUri: redirect_uri as string,
    originalState: state as string,
    clientId: client_id as string,
    codeChallenge: code_challenge as string,
    codeChallengeMethod: code_challenge_method as string,
    createdAt: new Date(),
  })

  // Construct HeadHunter authorization URL with our callback
  const hhAuthUrl = new URL('https://hh.ru/oauth/authorize')
  hhAuthUrl.searchParams.set('client_id', env.HH_CLIENT_ID || '')
  hhAuthUrl.searchParams.set('response_type', 'code')
  hhAuthUrl.searchParams.set(
    'redirect_uri',
    env.HH_REDIRECT_URI || `http://${env.HOST}:${env.PORT}/oauth/callback/debug`
  )
  hhAuthUrl.searchParams.set('state', stateKey) // Use our state key

  logger.log(`Facade authorize: Redirecting to HeadHunter with state=${stateKey}`)

  // Redirect user to HeadHunter authorization
  res.redirect(hhAuthUrl.toString())
})

// Facade OAuth Token endpoint - exchanges authorization code for access token
app.post('/oauth/token', express.urlencoded({ extended: true }), async (req, res) => {
  const { grant_type, client_id, code, redirect_uri, code_verifier } = req.body

  // Validate required parameters
  if (grant_type !== 'authorization_code' || !client_id || !code || !redirect_uri) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Invalid token request parameters',
    })
  }

  try {
    // Use the configured redirect_uri instead of the client's redirect_uri
    const configuredRedirectUri = env.HH_REDIRECT_URI || `http://${env.HOST}:${env.PORT}/oauth/callback/debug`

    // Prepare token request for HeadHunter
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.HH_CLIENT_ID || '',
      client_secret: env.HH_CLIENT_SECRET || '',
      code: code,
      redirect_uri: configuredRedirectUri, // Use our configured redirect_uri, not client's
    })

    // Add PKCE code_verifier if provided by client
    if (code_verifier) {
      tokenParams.set('code_verifier', code_verifier)
    }

    logger.log(`Facade token: Exchanging code with HeadHunter, redirect_uri=${configuredRedirectUri}`)

    // Exchange code with HeadHunter token endpoint
    const tokenResponse = await fetch('https://api.hh.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MCP-Facade-Server/1.0',
      },
      body: tokenParams,
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      logger.error(`HeadHunter token exchange failed: ${tokenResponse.status} ${errorText}`)
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Authorization code is invalid or expired',
      })
    }

    const tokenData = (await tokenResponse.json()) as Record<string, unknown>

    logger.log(`Facade token: Successfully exchanged code for HeadHunter access token`)

    // Return the token response from HeadHunter (with our issuer)
    res.json({
      ...tokenData,
      issuer: `http://${env.HOST}:${env.PORT}`, // Override issuer to point to our facade
    })
  } catch (error) {
    logger.error('Token exchange error:', error instanceof Error ? error.message : String(error))
    res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error during token exchange',
    })
  }
})

// Enhanced proxy callback endpoint for facade authorization flow
app.get('/oauth/callback/debug', (req, res) => {
  const { code, state, error, error_description } = req.query

  if (error) {
    logger.error(`HeadHunter authorization error: ${error} - ${error_description}`)
    return res.status(400).json({
      error: error as string,
      error_description: error_description as string,
    })
  }

  if (!code || !state) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing authorization code or state parameter',
    })
  }

  // Retrieve stored authorization request
  const authSession = sessions.get(state as string)
  if (!authSession) {
    logger.error(`No session found for state: ${state}`)
    return res.status(400).json({
      error: 'invalid_state',
      error_description: 'Invalid or expired authorization request',
    })
  }

  // Clean up session
  sessions.delete(state as string)

  // Redirect back to original client with authorization code
  const callbackUrl = new URL(authSession.originalRedirectUri as string)
  callbackUrl.searchParams.set('code', code as string)
  if (authSession.originalState) {
    callbackUrl.searchParams.set('state', authSession.originalState as string)
  }

  logger.log(`Facade callback: Redirecting to original client: ${callbackUrl.toString()}`)
  res.redirect(callbackUrl.toString())
})

// Session management middleware
function getOrCreateSession(req: express.Request): string {
  let sessionId = req.get('Mcp-Session-Id')

  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = crypto.randomUUID()
    sessions.set(sessionId, {
      id: sessionId,
      createdAt: new Date(),
      lastAccessAt: new Date(),
    })
  } else {
    const session = sessions.get(sessionId)
    if (session) {
      session.lastAccessAt = new Date()
    }
  }

  return sessionId
}

// Authorization middleware
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .set(
        'WWW-Authenticate',
        `Bearer realm="MCP Server", resource="http://${env.HOST}:${env.PORT}/.well-known/oauth-protected-resource"`
      )
      .json({ error: 'Authorization required' })
  }

  const token = authHeader.substring(7)
  if (!token) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Validate HeadHunter access token
  try {
    const response = await fetch('https://api.hh.ru/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'MCP-Server/1.0',
      },
    })

    if (!response.ok) {
      logger.debug(`Token validation failed: ${response.status} ${response.statusText}`)
      return res
        .status(401)
        .set(
          'WWW-Authenticate',
          `Bearer realm="MCP Server", resource="http://${env.HOST}:${env.PORT}/.well-known/oauth-protected-resource", error="invalid_token"`
        )
        .json({ error: 'Invalid or expired token' })
    }

    const userInfo = (await response.json()) as Record<string, unknown>
    const userEmail = userInfo.email as string | undefined
    const userId = userInfo.id as string | undefined
    logger.debug(`Authenticated user: ${userEmail || userId}`)

    // Store user info in request for later use
    req.user = userInfo
    next()
  } catch (error) {
    logger.error('Token validation error:', error instanceof Error ? error.message : String(error))
    return res.status(500).json({ error: 'Token validation failed' })
  }
}

// MCP endpoint - POST for JSON-RPC requests
app.post('/mcp', requireAuth, async (req, res) => {
  try {
    const sessionId = req.get('Mcp-Session-Id')
    logger.log(sessionId ? `MCP request for session: ${sessionId}` : 'New MCP request')

    let transport: StreamableHTTPServerTransport

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId]
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        enableJsonResponse: true, // Enable JSON response mode for simplicity
        onsessioninitialized: (sessionId) => {
          logger.log(`Session initialized with ID: ${sessionId}`)
          transports[sessionId] = transport
        },
      })

      // Set up cleanup on close
      transport.onclose = () => {
        const sid = transport.sessionId
        if (sid && transports[sid]) {
          logger.log(`Transport closed for session ${sid}`)
          delete transports[sid]
        }
      }

      // Connect transport to MCP server BEFORE handling request
      await mcpServer.connect(transport)
      await transport.handleRequest(req, res, req.body)
      return // Already handled
    } else {
      // Invalid request - no session ID or not initialization request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      })
      return
    }

    // Handle the request with existing transport
    await transport.handleRequest(req, res, req.body)
  } catch (error) {
    logger.error('MCP request error:', error instanceof Error ? error.message : String(error))
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : String(error),
        },
        id: req.body?.id || null,
      })
    }
  }
})

// MCP endpoint - GET for SSE streams
app.get('/mcp', requireAuth, (req, res) => {
  const sessionId = getOrCreateSession(req)

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': req.get('Origin') || '*',
    'Access-Control-Allow-Headers': 'Authorization, Mcp-Session-Id',
    'Mcp-Session-Id': sessionId,
  })

  // Send initial connection event
  res.write(`id: ${Date.now()}\n`)
  res.write(`event: connected\n`)
  res.write(`data: {"sessionId": "${sessionId}"}\n\n`)

  // Handle client disconnect
  req.on('close', () => {
    res.end()
  })

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`id: ${Date.now()}\n`)
    res.write(`event: heartbeat\n`)
    res.write(`data: {"timestamp": "${new Date().toISOString()}"}\n\n`)
  }, 30000)

  req.on('close', () => {
    clearInterval(keepAlive)
  })
})

// Session termination endpoint
app.delete('/mcp', requireAuth, (req, res) => {
  const sessionId = req.get('Mcp-Session-Id')

  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId)
    res.json({ message: 'Session terminated' })
  } else {
    res.status(404).json({ error: 'Session not found' })
  }
})

// OAuth endpoints are handled by the authorization server directly:
// - Authorization: https://api.hh.ru/oauth/authorize (adjusted for auth domain)
// - Token: https://api.hh.ru/token
// - Inspector will communicate with the authorization server directly for OAuth flow

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '',
  })
})

async function main() {
  try {
    const port = parseInt(env.PORT)
    const host = env.HOST

    app.listen(port, host, () => {
      logger.log(` MCP Server (OAuth HTTP) started on http://${host}:${port}`)
      logger.log(`MCP endpoint: http://${host}:${port}/mcp`)
      logger.log(`OAuth metadata: http://${host}:${port}/.well-known/oauth-protected-resource`)
    })
  } catch (error) {
    console.error('Server startup error:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.log('Shutting down MCP Server...')

  // Close all active transports
  for (const sessionId in transports) {
    try {
      logger.log(`Closing transport for session ${sessionId}`)
      await transports[sessionId].close()
      delete transports[sessionId]
    } catch (error) {
      logger.error(
        `Error closing transport for session ${sessionId}:`,
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  logger.log('Server shutdown complete')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.log('Shutting down MCP Server...')

  // Close all active transports
  for (const sessionId in transports) {
    try {
      logger.log(`Closing transport for session ${sessionId}`)
      await transports[sessionId].close()
      delete transports[sessionId]
    } catch (error) {
      logger.error(
        `Error closing transport for session ${sessionId}:`,
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  logger.log('Server shutdown complete')
  process.exit(0)
})

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
