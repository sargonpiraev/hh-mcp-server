# HeadHunter MCP Server for Job Seekers

A Model Context Protocol (MCP) server for the HeadHunter API focused on job seeker functionality. This server allows authenticated users to manage their HeadHunter profile, resumes, and job applications through natural language interactions.

## Features

- 🔍 **User Profile Management** - View and manage your HeadHunter profile
- 📄 **Resume Management** - View detailed resume information
- 💼 **Job Application Management** - Manage negotiations and communications with employers
- ⭐ **Vacancy Search & Favorites** - Search for jobs and manage your favorites
- 📊 **Application Tracking** - Track your job applications and responses

## Prerequisites

- Node.js 18+ 
- HeadHunter OAuth access token
- Valid User-Agent string (required by HeadHunter API)

## Installation

### From npm (when published)

```bash
npm install -g @sargonpiraev/hh-mcp-server
```

### From source

```bash
git clone <repository-url>
cd hh-mcp-server
npm install
npm run build
```

## Configuration

Create a `.env` file in the project root or set environment variables:

```env
HH_ACCESS_TOKEN=your_headhunter_oauth_token
HH_USER_AGENT=YourApp/1.0.0 (contact@example.com)
```

### Getting HeadHunter OAuth Token

1. Register your application at [HeadHunter Developer Portal](https://dev.hh.ru/)
2. Follow the OAuth 2.0 flow to get an access token
3. Ensure your application has the necessary scopes for user data access

### User-Agent Format

HeadHunter API requires a specific User-Agent format:
```
ApplicationName/Version (contact@example.com)
```

## Usage

### With MCP Inspector (Development)

```bash
npm run inspect
```

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "headhunter-job-seeker": {
      "command": "node",
      "args": ["/path/to/hh-mcp-server/build/index.js"],
      "env": {
        "HH_ACCESS_TOKEN": "your_token_here",
        "HH_USER_AGENT": "YourApp/1.0.0 (contact@example.com)"
      }
    }
  }
}
```

## Available Tools

### User Profile Management

#### `get-current-user-info`
Get information about the current authenticated user including personal information, contact details, and account settings.

**Example:**
```
Get my current user information
```

### Resume Management

#### `get-my-resumes`
Get list of user's resumes.

**Example:**
```
Show me all my resumes
```

#### `get-resume`
Get detailed information about a specific resume.

**Parameters:**
- `resume_id` (string) - Resume ID

**Example:**
```
Get details for resume ID abc123
```

### Negotiations Management

#### `get-negotiations`
Get list of negotiations (job applications and responses) with optional filtering.

**Parameters:**
- `page` (number, optional) - Page number (default: 0)
- `per_page` (number, optional) - Items per page (default: 20)
- `order_by` (enum, optional) - Sort order: 'created_at' | 'updated_at'
- `order_dir` (enum, optional) - Sort direction: 'asc' | 'desc'

**Example:**
```
Show me my recent job applications, sorted by update date
```

#### `get-negotiation`
Get detailed information about a specific negotiation.

**Parameters:**
- `negotiation_id` (string) - Negotiation ID

**Example:**
```
Get details for negotiation ID xyz789
```

#### `send-negotiation-message`
Send a message in a negotiation.

**Parameters:**
- `negotiation_id` (string) - Negotiation ID
- `message` (string) - Message text to send

**Example:**
```
Send a follow-up message to negotiation ID xyz789: "Thank you for your time. I'm looking forward to hearing from you."
```

### Vacancy Application

#### `apply-to-vacancy`
Apply to a job vacancy using one of your resumes.

**Parameters:**
- `vacancy_id` (string) - Vacancy ID to apply to
- `resume_id` (string) - Resume ID to use for application
- `message` (string, optional) - Cover letter message

**Example:**
```
Apply to vacancy ID 12345 using resume ID abc123 with cover letter "I am very interested in this position..."
```

### Vacancy Search and Favorites

#### `search-vacancies`
Search for job vacancies with various filters.

**Parameters:**
- `text` (string, optional) - Search query text
- `area` (string, optional) - Area ID for location filtering (e.g. "1" for Moscow)
- `salary` (number, optional) - Minimum salary amount
- `currency` (string, optional) - Currency code (default: RUR)
- `only_with_salary` (boolean, optional) - Show only vacancies with salary
- `experience` (string, optional) - Experience level
- `employment` (string, optional) - Employment type
- `schedule` (string, optional) - Work schedule
- `page` (number, optional) - Page number
- `per_page` (number, optional) - Items per page

**Example:**
```
Search for JavaScript developer jobs in Moscow with salary above 200000 RUR, remote work preferred
```

#### `get-vacancy`
Get detailed information about a specific vacancy.

**Parameters:**
- `vacancy_id` (string) - Vacancy ID

**Example:**
```
Get details for vacancy ID 54321
```

#### `get-favorite-vacancies`
Get list of favorite vacancies.

**Example:**
```
Show me my favorite job postings
```

#### `add-vacancy-to-favorites`
Add a vacancy to favorites.

**Parameters:**
- `vacancy_id` (string) - Vacancy ID to add to favorites

**Example:**
```
Add vacancy ID 54321 to my favorites
```

#### `remove-vacancy-from-favorites`
Remove a vacancy from favorites.

**Parameters:**
- `vacancy_id` (string) - Vacancy ID to remove from favorites

**Example:**
```
Remove vacancy ID 54321 from my favorites
```

#### `get-vacancies-similar-to-resume`
Get vacancies similar to a specific resume.

**Parameters:**
- `resume_id` (string) - Resume ID to find similar vacancies for
- `page` (number, optional) - Page number (default: 0)
- `per_page` (number, optional) - Items per page (default: 20)

**Example:**
```
Find job opportunities similar to my resume ID abc123
```

## Error Handling

The server includes comprehensive error handling for:
- Authentication errors
- API rate limits
- Invalid parameters
- Network issues
- HeadHunter API errors

All errors are logged and returned with descriptive messages.

## Development

### Build

```bash
npm run build
```

### Development with watch mode

```bash
npm run dev
```

### Type checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues related to:
- **This MCP Server**: Open an issue on GitHub
- **HeadHunter API**: Check [HeadHunter API documentation](https://dev.hh.ru/)
- **MCP Protocol**: Check [Model Context Protocol documentation](https://modelcontextprotocol.io/)

## Related Projects

- [hh-api-client](../hh-api-client) - TypeScript client for HeadHunter API
- [habitify-mcp-server](../habitify-mcp-server) - MCP server for Habitify API

---

**Note**: This is an unofficial client for the HeadHunter API. Make sure to comply with HeadHunter's terms of service when using this tool. 