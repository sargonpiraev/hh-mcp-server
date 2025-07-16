# HeadHunter MCP Server

MCP Server for HeadHunter API - job search and vacancy management

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Set up environment:

```bash
cp .env.example .env
# Edit .env with your API credentials
```

3. Start the server:

```bash
npm start
```

## Configuration

Add to your MCP client config:

```json
{
  "mcpServers": {
    "hh-mcp-server": {
      "command": "node",
      "args": ["/dist/index.js"],
      "env": {
        "HH_USER_AGENT": "your_hh_user_agent"
      }
    }
  }
}
```

## Available Tools

- **get-vacancies**: Search for vacancies
- **get-dictionaries**: Directories of fields
- **get-areas**: Tree view of all regions
- **get-languages**: The list of all languages
- **get-industries**: Industries
- **get-metro**: The list of metro stations in all cities
- **get-professional-roles**: Professional role directory
- **get-employers**: Employer search

## Development

```bash
npm run build    # Build TypeScript
npm run test     # Run tests
npm run lint     # Check code style
```

## License

MIT
