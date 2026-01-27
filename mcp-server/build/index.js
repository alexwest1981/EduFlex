import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { registerListCourses } from "./tools/list_courses.js";
import { registerSearchContent } from "./tools/search_content.js";
import { registerSystemHealth } from "./tools/get_system_health.js";
dotenv.config();
const server = new McpServer({
    name: "eduflex-mcp-server",
    version: "1.0.0",
});
registerListCourses(server);
registerSearchContent(server);
registerSystemHealth(server);
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("EduFlex MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
