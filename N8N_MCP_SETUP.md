# n8n MCP Server Setup

This project is configured to use the n8n MCP (Model Context Protocol) server, which allows Claude Code to interact directly with your n8n instance.

## Prerequisites

- An n8n instance running at `https://n8n.hudsond.me` (or update the URL in `.env`)
- An n8n API key with appropriate permissions

## Configuration Files

### 1. `.mcp.json` (MCP Server Configuration)

This file defines the n8n MCP server configuration:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_KEY": "${N8N_API_KEY}",
        "N8N_BASE_URL": "${N8N_BASE_URL}"
      }
    }
  }
}
```

### 2. `.env` (API Keys)

Add your n8n API key and base URL to the `.env` file:

```env
# n8n Configuration
N8N_API_KEY=your_n8n_api_key_here
N8N_BASE_URL=https://n8n.hudsond.me
```

### 3. `.claude/settings.local.json` (Enable MCP Server)

The project settings enable all MCP servers automatically:

```json
{
  "enableAllProjectMcpServers": true
}
```

## Getting Your n8n API Key

1. Log in to your n8n instance at `https://n8n.hudsond.me`
2. Navigate to **Settings** → **API Keys** (or **Personal Settings** → **API Keys**)
3. Click **Create API Key**
4. Give it a descriptive name (e.g., "Claude Code MCP")
5. Copy the generated API key
6. Paste it into your `.env` file as the value for `N8N_API_KEY`

## Testing the Connection

Once you've added your API key:

1. Restart your Claude Code session
2. The n8n MCP server will be automatically loaded
3. Claude can now interact with your n8n workflows

You can verify the connection by asking Claude to:
- List your n8n workflows
- Get workflow details
- Execute workflows
- Monitor workflow executions

## Available n8n MCP Capabilities

The n8n MCP server provides tools for:

- **Workflow Management**: List, create, update, and delete workflows
- **Workflow Execution**: Trigger workflows and monitor their execution
- **Node Management**: Access workflow nodes and their configurations
- **Credentials**: Manage n8n credentials (read-only for security)
- **Executions**: View workflow execution history and logs

## Security Notes

- The `N8N_API_KEY` is stored in `.env` which is git-ignored
- Never commit your API key to version control
- The API key has the same permissions as the user who created it
- Consider creating a dedicated n8n user with limited permissions for Claude Code

## Troubleshooting

### MCP Server Not Loading

If the n8n MCP server doesn't load:

1. Check that your `.env` file has both `N8N_API_KEY` and `N8N_BASE_URL` set
2. Verify the API key is valid by testing it with a curl command:
   ```bash
   curl -H "X-N8N-API-KEY: your_api_key" https://n8n.hudsond.me/api/v1/workflows
   ```
3. Restart your Claude Code session
4. Check Claude Code logs for any MCP server errors

### Permission Errors

If you get permission errors:
- Ensure your API key has the necessary permissions
- Check that your n8n user has access to the workflows you're trying to access

## Related Files

- `src/lib/webhook.ts` - n8n webhook integration for build-site, send-sms, and send-email
- `.env` - Environment variables including n8n configuration
- `EMAIL_AUTOMATION_SETUP.md` - Guide for setting up n8n email automation workflows

## Example Usage

With the MCP server configured, you can ask Claude:

- "List all my n8n workflows"
- "Show me the details of the 'send-email' workflow"
- "Execute the build-site workflow with these parameters: ..."
- "What workflows are currently running?"
- "Show me the execution logs for the last email workflow run"

Claude will use the n8n MCP server to interact with your n8n instance directly!
