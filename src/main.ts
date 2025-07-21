#!/usr/bin/env node

import express from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import { mcpServer, envSchema as baseEnvSchema } from './server.js'

const envSchema = baseEnvSchema.extend({
  PORT: z.string().optional().default('3000'),
  HOST: z.string().optional().default('127.0.0.1'),
  OAUTH_CLIENT_ID: z.string().optional(),
  OAUTH_CLIENT_SECRET: z.string().optional(),
  OAUTH_AUTHORIZATION_SERVER: z.string().optional(),
})

const env = envSchema.parse(process.env)

const app = express()
const sessions = new Map<string, any>()

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
    authorization_servers: env.OAUTH_AUTHORIZATION_SERVER ? [env.OAUTH_AUTHORIZATION_SERVER] : [],
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    bearer_methods_supported: ['header'],
    resource_registration_endpoint: `${baseUrl}/oauth/resource-registration`
  })
})

// OAuth 2.0 Authorization Server Metadata endpoint
app.get('/.well-known/oauth-authorization-server', (req, res) => {
  const baseUrl = `http://${env.HOST}:${env.PORT}`
  
  if (!env.OAUTH_AUTHORIZATION_SERVER) {
    return res.status(404).json({ error: 'OAuth authorization server not configured' })
  }
  
  res.json({
    issuer: env.OAUTH_AUTHORIZATION_SERVER,
    authorization_endpoint: `${env.OAUTH_AUTHORIZATION_SERVER}/oauth/authorize`,
    token_endpoint: `${env.OAUTH_AUTHORIZATION_SERVER}/oauth/token`,
    registration_endpoint: `${env.OAUTH_AUTHORIZATION_SERVER}/oauth/register`,
    jwks_uri: `${env.OAUTH_AUTHORIZATION_SERVER}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    code_challenge_methods_supported: ['S256'],
    resource_parameter_supported: true
  })
})

// JWKS endpoint (placeholder)
app.get('/.well-known/jwks.json', (req, res) => {
  res.json({
    keys: []
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
      lastAccessAt: new Date()
    })
  } else {
    const session = sessions.get(sessionId)
    session.lastAccessAt = new Date()
  }
  
  return sessionId
}

// Authorization middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401)
      .set('WWW-Authenticate', `Bearer realm="MCP Server", resource="http://${env.HOST}:${env.PORT}/.well-known/oauth-protected-resource"`)
      .json({ error: 'Authorization required' })
  }
  
  // TODO: Validate access token here
  // For now, just check if token is present
  const token = authHeader.substring(7)
  if (!token) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  
  next()
}

// MCP endpoint - POST for JSON-RPC requests
app.post('/mcp', requireAuth, async (req, res) => {
  try {
    const sessionId = getOrCreateSession(req)
    res.set('Mcp-Session-Id', sessionId)
    res.set('Content-Type', 'application/json')
    
    // Handle JSON-RPC request through MCP server
    const result = await mcpServer.server.request(req.body)
    res.json(result)
  } catch (error) {
    console.error('MCP request error:', error)
    res.status(500).json({ 
      jsonrpc: '2.0', 
      error: { 
        code: -32603, 
        message: 'Internal error',
        data: error instanceof Error ? error.message : String(error)
      },
      id: req.body?.id || null
    })
  }
})

// MCP endpoint - GET for SSE streams
app.get('/mcp', requireAuth, (req, res) => {
  const sessionId = getOrCreateSession(req)
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': req.get('Origin') || '*',
    'Access-Control-Allow-Headers': 'Authorization, Mcp-Session-Id',
    'Mcp-Session-Id': sessionId
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: ''
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