#!/usr/bin/env node

import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { z } from 'zod'
import { mcpServer, envSchema as baseEnvSchema } from './server.js'

// Extend Express Request type to include user info
declare module 'express-serve-static-core' {
  interface Request {
    user?: Record<string, unknown>
  }
}

const envSchema = baseEnvSchema.extend({
  PORT: z.string().optional().default('3000'),
  HOST: z.string().optional().default('127.0.0.1'),
  HH_CLIENT_ID: z.string(),
  HH_CLIENT_SECRET: z.string(),
  HH_USER_AGENT: z.string(),
  HH_REDIRECT_URI: z.string(),
})

const env = envSchema.parse(process.env)

const app = express()
const sessions = new Map<string, Record<string, unknown>>()

// Enable CORS for all routes
app.use(cors())

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
  res.json({
    issuer: 'https://api.hh.ru',
    authorization_endpoint: 'https://hh.ru/oauth/authorize',
    token_endpoint: 'https://api.hh.ru/token',
    registration_endpoint: `${req.protocol}://${req.get('host')}/oauth/register`,
    jwks_uri: `${req.protocol}://${req.get('host')}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: [],
    // Note: This endpoint simulates DCR for Inspector compatibility
    // Real HeadHunter OAuth happens via pre-registered clients at dev.hh.ru
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

    logger.log(`DCR simulation: Returning HeadHunter client credentials for "${client_name}"`)

    // Return successful registration response with HeadHunter client_id
    res.json({
      client_id,
      client_name,
      grant_types,
      response_types,
      redirect_uris, // Use the redirect_uris from the request
      scope,
      token_endpoint_auth_method: 'client_secret_basic', // HeadHunter uses client_secret
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

  res.json({
    client_id: env.HH_CLIENT_ID,
    authorization_endpoint: 'https://hh.ru/oauth/authorize',
    token_endpoint: 'https://api.hh.ru/token',
    scope: '', // OAuth server doesn't use explicit scopes
    response_type: 'code',
    redirect_uri: env.HH_REDIRECT_URI || 'http://localhost:6274/oauth/callback/debug', // Configurable redirect URI
    code_challenge_method: 'S256', // PKCE for security
  })
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
    const sessionId = getOrCreateSession(req)
    res.set('Mcp-Session-Id', sessionId)
    res.set('Content-Type', 'application/json')

    // Handle JSON-RPC request through MCP server
    const result = await mcpServer.server.request(req.body, z.any())
    res.json(result)
  } catch (error) {
    console.error('MCP request error:', error)
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
process.on('SIGINT', () => {
  logger.log('Shutting down MCP Server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  logger.log('Shutting down MCP Server...')
  process.exit(0)
})

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
