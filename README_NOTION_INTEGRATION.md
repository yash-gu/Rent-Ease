# Notion MCP Server Integration for RentEase

This workspace is configured to use the Notion Model Context Protocol (MCP) server.

## Setup Instructions

### 1. Configuration Files
The following configuration files have been created:
- `.vscode/mcp.json` - MCP server configuration
- `.vscode/settings.json` - VS Code settings with Notion API key

### 2. Starting the Notion MCP Server

1. **Open Command Palette** in VS Code:
   - macOS: `Cmd+Shift+P`
   - Windows/Linux: `Ctrl+Shift+P`

2. **Run the command**: `MCP: List Servers`

3. **Start the Notion server** from the list

4. **Complete OAuth flow** when prompted (if required)

### 3. Available Notion MCP Tools

Once connected, you'll have access to Notion tools including:
- Database querying and manipulation
- Page creation and editing
- Content management
- Property operations

### 4. Using Notion with RentEase

The Notion integration can be used for:
- **Project Documentation**: Store PRDs, specifications, and requirements
- **Property Management**: Track properties, bookings, and maintenance
- **Team Collaboration**: Share updates and progress with team members
- **Content Management**: Store marketing content and property descriptions

### 5. Security Notes

Your Notion API key is stored in `.vscode/settings.json`. Make sure to:
- Keep this file secure
- Don't commit it to public repositories
- Use environment variables in production

## Troubleshooting

If you encounter issues:

1. **Check API Key**: Ensure the Notion API key is valid
2. **Verify Permissions**: The API key needs appropriate permissions in Notion
3. **Check Connection**: Ensure you have internet connectivity
4. **Restart VS Code**: Sometimes a restart helps refresh MCP connections

## Additional Resources

- [Notion API Documentation](https://developers.notion.com/)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [VS Code MCP Extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.vscode-mcp)