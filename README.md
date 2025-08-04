# HeadHunter API MCP Server 🔧

![npm version](https://img.shields.io/npm/v/@sargonpiraev/hh-mcp-server)
![npm downloads](https://img.shields.io/npm/dw/@sargonpiraev/hh-mcp-server)
![license](https://img.shields.io/github/license/sargonpiraev/hh-mcp-server)
![pipeline status](https://gitlab.com/sargonpiraev/hh-mcp-server/badges/main/pipeline.svg)
![smithery badge](https://smithery.ai/badge/@sargonpiraev/hh-mcp-server)
![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
[![Join Discord](https://img.shields.io/discord/1331631275464671347?color=7289da&label=Discord&logo=discord)](https://discord.gg/ZsWGxRGj)

## Features

- 🔌 **Seamless AI Integration**: Direct HeadHunter API API access from Claude, Cursor, and VS Code
- 🤖 **Automated Workflows**: Automate HeadHunter API operations and data access
- 📊 **Complete API Coverage**: 167+ tools covering all major HeadHunter API features
- ⚡ **Real-time Access**: Access HeadHunter API data instantly from AI assistants
- 🔧 **Professional Integration**: Error handling, validation, and comprehensive logging

## Get Your Credentials

Before installation, you'll need a HeadHunter API API key:

1. Open HeadHunter API app or web interface
2. Go to **Settings → Account → API Access**
3. Generate new API key or copy existing one
4. Save this key for the installation steps below

## Requirements

- Node.js >= v18.0.0
- HeadHunter API API key
- Cursor, VS Code, Claude Desktop or another MCP Client

## Installation

<details>
<summary><b>Installing via Smithery</b></summary>

To install HeadHunter API MCP Server for any client automatically via [Smithery](https://smithery.ai):

```bash
npx -y @smithery/cli@latest install @sargonpiraev/hh-mcp-server --client <CLIENT_NAME>
```

</details>

<details>
<summary><b>Install in Cursor</b></summary>

#### Cursor One-Click Installation

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=@sargonpiraev/hh-mcp-server&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBzYXJnb25waXJhZXYvaGgtbWNwLXNlcnZlciJdLCJlbnYiOnsiSEhfQ0xJRU5UX0lEIjoieW91cl9oaF9jbGllbnRfaWRfaGVyZSIsIkhIX0NMSUVOVF9TRUNSRVQiOiJ5b3VyX2hoX2NsaWVudF9zZWNyZXRfaGVyZSIsIkhIX1VTRVJfQUdFTlQiOiJ5b3VyX2hoX3VzZXJfYWdlbnRfaGVyZSIsIkhIX1JFRElSRUNUX1VSSSI6InlvdXJfaGhfcmVkaXJlY3RfdXJpX2hlcmUifX0=)

#### Manual Configuration

Add to your Cursor `~/.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "hh-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sargonpiraev/hh-mcp-server"],
      "env": {
        "HH_CLIENT_ID": "your-hh_client_id",
        "HH_CLIENT_SECRET": "your-hh_client_secret",
        "HH_USER_AGENT": "your-hh_user_agent",
        "HH_REDIRECT_URI": "your-hh_redirect_uri"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in VS Code</b></summary>

[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_MCP-0098FF)](vscode:mcp/install?%7B%22name%22%3A%22hh-mcp-server%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22@sargonpiraev/hh-mcp-server%22%5D%7D)

Or add manually to your VS Code settings:

```json
"mcp": {
  "servers": {
    "hh-mcp-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@sargonpiraev/hh-mcp-server"],
      "env": {
        "HH_CLIENT_ID": "your-hh_client_id",
        "HH_CLIENT_SECRET": "your-hh_client_secret",
        "HH_USER_AGENT": "your-hh_user_agent",
        "HH_REDIRECT_URI": "your-hh_redirect_uri"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Claude Desktop</b></summary>

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hh-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sargonpiraev/hh-mcp-server"],
      "env": {
        "HH_CLIENT_ID": "your-hh_client_id",
        "HH_CLIENT_SECRET": "your-hh_client_secret",
        "HH_USER_AGENT": "your-hh_user_agent",
        "HH_REDIRECT_URI": "your-hh_redirect_uri"
      }
    }
  }
}
```

</details>

## Available Tools

- **`confirm-phone-in-resume`**: Verify phone with a code
- **`get-manager-settings`**: Manager preferences
- **`get-employer-manager-limits`**: Daily limit of resume views for current manager
- **`get-employer-addresses`**: Directory of employer&#x27;s addresses
- **`get-employer-managers`**: Directory of employer&#x27;s managers
- **`add-employer-manager`**: Adding a manager
- **`get-employer-manager-types`**: Directory of manager types and privileges
- **`get-manager-accounts`**: Manager&#x27;s work accounts
- **`get-applicant-phone-info`**: Get information about the applicant&#x27;s phone number
- **`get-address`**: Get address by ID
- **`edit-employer-manager`**: Editing a manager
- **`get-employer-manager`**: Getting information about a manager
- **`delete-employer-manager`**: Deleting a manager
- **`send-code-for-verify-phone-in-resume`**: Send verification code to the phone number on CV
- **`authorize`**: Getting an access-token
- **`invalidate-token`**: Access token invalidation
- **`get-current-user-info`**: Info on current authorized user
- **`edit-current-user-info`**: Editing information on the authorized user
- **`get-locales-for-resume`**: The list of available resume locales
- **`get-locales`**: The list of available locales
- **`get-positions-suggestions`**: Resume position suggestions
- **`get-educational-institutions-suggests`**: Educational institution name suggestions
- **`get-area-leaves-suggests`**: Suggestions for all regions that are leaves in the region tree
- **`get-skill-set-suggests`**: Key skills suggestions
- **`get-vacancy-positions-suggests`**: Vacancy position suggestions
- **`get-professional-roles-suggests`**: Professional role suggestions
- **`get-resume-search-keywords-suggests`**: Suggestions for resume search key words
- **`get-areas-suggests`**: Suggestions for all regions
- **`get-vacancy-search-keywords`**: Suggestions for vacancy search key words
- **`get-fields-of-study-suggestions`**: Specialization suggestions
- **`get-registered-companies-suggests`**: Organization suggestions
- **`read-resume-profile`**: Получение схемы резюме-профиля соискателя для резюме
- **`update-resume-profile`**: Обновление резюме-профиля соискателя
- **`create-resume-profile`**: Создание резюме-профиля соискателя
- **`get-resume-profile-dictionaries`**: Получение cловарей резюме-профиля
- **`get-payable-api-actions`**: Information about active API services for payable methods
- **`get-payable-api-method-access`**: Checking access to the paid methods
- **`get-saved-vacancy-searches`**: List of saved vacancy searches
- **`create-saved-vacancy-search`**: Creating new saved vacancy search
- **`get-vacancy-visitors`**: Vacancy visitors
- **`get-vacancy`**: View a vacancy
- **`edit-vacancy`**: Editing vacancies
- **`get-blacklisted-vacancies`**: List of hidden vacancies
- **`publish-vacancy`**: Publishing job vacancies
- **`get-vacancies`**: Search for vacancies
- **`get-vacancies-related-to-vacancy`**: Search for vacancies related to a vacancy
- **`get-saved-vacancy-search`**: Obtaining single saved vacancy search
- **`update-saved-vacancy-search`**: Updating saved vacancy search
- **`delete-saved-vacancy-search`**: Deleting saved vacancy search
- **`get-vacancies-similar-to-vacancy`**: Search for vacancies similar to a vacancy
- **`get-vacancy-upgrade-list`**: List of vacancy upgrades
- **`get-vacancies-similar-to-resume`**: Search for vacancies similar to a resume
- **`get-favorite-vacancies`**: List of favorited vacancies
- **`add-vacancy-to-blacklisted`**: Adding a vacancy in the blacklist
- **`delete-vacancy-from-blacklisted`**: Deleting a vacancy from the blacklist
- **`get-active-vacancy-list`**: View a published vacancy list
- **`get-hidden-vacancies`**: Deleted vacancy list
- **`add-vacancy-to-hidden`**: Deleting vacancies
- **`restore-vacancy-from-hidden`**: Restoring deleted vacancies
- **`get-vacancy-conditions`**: Conditions for filling out fields when publishing and editing vacancies
- **`get-prolongation-vacancy-info`**: Information about vacancy prolongation possibility
- **`vacancy-prolongation`**: Vacancy prolongation
- **`add-vacancy-to-archive`**: Archiving vacancies
- **`get-pref-negotiations-order`**: Viewing preferred options for sorting responses
- **`put-pref-negotiations-order`**: Changing preferred options for sorting responses
- **`add-vacancy-to-favorite`**: Add a vacancy in favorited
- **`delete-vacancy-from-favorite`**: Delete a vacancy from favorited
- **`get-available-vacancy-types`**: Possible options available to current manager for publishing of vacancies
- **`get-vacancy-stats`**: Vacancy statistics
- **`get-archived-vacancies`**: Archived vacancy list
- **`get-artifacts-portfolio-conditions`**: Conditions for uploading portfolio
- **`edit-artifact`**: Editing an artifact
- **`delete-artifact`**: Deleting an artifact
- **`load-artifact`**: Uploading an artifact
- **`get-artifacts-portfolio`**: Getting portfolios
- **`get-artifact-photos-conditions`**: Conditions for uploading photos
- **`get-artifact-photos`**: Getting photos
- **`get-dictionaries`**: Directories of fields
- **`get-languages`**: The list of all languages
- **`get-educational-institutions-dictionary`**: Basic information about educational institutions
- **`get-skills`**: The list of key skills
- **`get-professional-roles-dictionary`**: Professional role directory
- **`get-faculties`**: List of educational institution faculties
- **`get-industries`**: Industries
- **`change-negotiation-action`**: Actions with collection response/invitation
- **`apply-to-vacancy`**: Apply for a vacancy
- **`get-negotiations`**: Negotiation list
- **`get-negotiations-statistics-manager`**: Negotiation statistics for the manager
- **`get-active-negotiations`**: Active negotiation list
- **`get-negotiation-message-templates`**: Template list for the negotiation
- **`get-collection-negotiations-list`**: Negotiation list of the collection
- **`invite-applicant-to-vacancy`**: Invite applicant for a vacancy
- **`get-negotiation-test-results`**: Get test results attached to the vacancy
- **`edit-negotiation-message`**: Edit messages in the response
- **`post-negotiations-topics-read`**: Mark responses as read
- **`hide-active-response`**: Hide response
- **`get-negotiation-item`**: Viewing the response/invitation
- **`put-negotiations-collection-to-next-state`**: Actions with responses/invitations
- **`get-negotiations-statistics-employer`**: Negotiation statistics for the company
- **`send-negotiation-message`**: Sending new message
- **`get-negotiation-messages`**: View the list of messages in the negotiation
- **`get-vacancy-draft`**: Obtaining a vacancy draft
- **`change-vacancy-draft`**: Editing a vacancy draft
- **`delete-vacancy-draft`**: Deleting a vacancy draft
- **`publish-vacancy-from-draft`**: Publishing a vacancy from draft
- **`search-for-vacancy-draft-duplicates`**: Checking for duplicates of a vacancy draft
- **`create-vacancy-draft`**: Creating vacancy draft
- **`get-vacancy-draft-list`**: Getting a list of vacancy drafts
- **`disable-automatic-vacancy-publication`**: Canceling vacancy auto publication
- **`change-webhook-subscription`**: Change a subscription on notifications
- **`cancel-webhook-subscription`**: Delete a subscription on notifications
- **`post-webhook-subscription`**: Subscription to notifications
- **`get-webhook-subscriptions`**: Obtain the list of notifications that the user is subscripted
- **`get-tests-dictionary`**: Employer&#x27;s test directory
- **`get-employer-vacancy-areas`**: List of regions with active vacancies
- **`get-employer-info`**: Employer info
- **`add-employer-to-blacklisted`**: Adding an employer to the blacklist
- **`delete-employer-from-blacklisted`**: Deleting an employer from the blacklist
- **`search-employer`**: Employer search
- **`get-employer-departments`**: Employer&#x27;s department directory
- **`get-vacancy-branded-templates-list`**: Employer&#x27;s branded vacancy templates
- **`get-blacklisted-employers`**: List of hidden employers
- **`get-all-districts`**: List of available city districts
- **`get-salary-evaluation`**: Salary assessment without forecasts
- **`get-metro-stations`**: The list of metro stations in all cities
- **`get-metro-stations-in-city`**: The list of metro stations in the specified city
- **`move-saved-resume-search`**: Moving saved resumes search to other manager
- **`get-resumes-by-status`**: Resumes grouped by the possibility of application for a given job
- **`get-resume-status`**: Resume status and readiness for publication
- **`get-resume-negotiations-history`**: History of responses/invitations for a resume
- **`get-saved-resume-search`**: Getting single saved resume search
- **`update-saved-resume-search`**: Updating saved resume search
- **`delete-saved-resume-search`**: Deleting saved resume search
- **`create-resume`**: Resume creating
- **`search-for-resumes`**: Resume search
- **`get-mine-resumes`**: List of resumes for current user
- **`publish-resume`**: Resume publication
- **`get-new-resume-conditions`**: Conditions to fill in the fields of a new resume
- **`get-suitable-resumes`**: List of resumes suitable for job application
- **`get-resume-conditions`**: Conditions to fill in the fields of an existent resume
- **`get-resume-view-history`**: History of resume views
- **`get-resume`**: View a resume
- **`delete-resume`**: Deleting a resume
- **`edit-resume`**: Resume updating
- **`get-resume-creation-availability`**: Availability of resume creation
- **`get-saved-resume-searches`**: List of Saved resume searches
- **`create-saved-resume-search`**: Creating new saved resumes search
- **`get-resume-access-types`**: Retrieving a list of resume visibility types
- **`update-applicant-comment`**: Update a comment
- **`delete-applicant-comment`**: Delete a comment
- **`get-applicant-comments-list`**: List of comments
- **`add-applicant-comment`**: Add a comment
- **`put-mail-templates-item`**: Edit a template for response to an applicant
- **`get-mail-templates`**: List of available templates for response to an applicant
- **`get-clickme-statistics`**: Getting info about Clickme ad campaign statistics
- **`get-countries`**: Countries
- **`get-areas`**: Tree view of all regions
- **`get-areas-from-specified`**: Region directory, starting from the specified region
- **`get-salary-employee-levels`**: Competency levels
- **`get-salary-salary-areas`**: Regions and cities
- **`get-salary-professional-areas`**: Professions and specializations
- **`get-salary-industries`**: Industries and fields of expertise
- **`get-resume-visibility-employers-list`**: Searching for employers to add to the visibility list
- **`get-resume-visibility-list`**: Getting visibility lists
- **`add-resume-visibility-list`**: Adding employers to the visibility list
- **`delete-resume-visibility-list`**: Clearing the visibility list
- **`delete-employer-from-resume-visibility-list`**: Removing employers from the visibility list

**Total: 167 tools available** 🎯

## Support This Project

Hi! I'm Sargon, a software engineer passionate about AI tools and automation. I create open-source MCP servers to help developers integrate AI assistants with their favorite services.

Your support helps me continue developing and maintaining these tools, and motivates me to create new integrations that make AI assistants even more powerful! 🚀

[![Support on Boosty](https://img.shields.io/badge/Support-Boosty-orange?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)](https://boosty.to/sargonpiraev)

## Connect with Author

- 🌐 Visit [sargonpiraev.com](https://sargonpiraev.com)
- 📧 Email: [sargonpiraev@gmail.com](mailto:sargonpiraev@gmail.com)
- 💬 Join [Discord](https://discord.gg/ZsWGxRGj)
