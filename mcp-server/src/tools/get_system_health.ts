
import { z } from "zod";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const ACTUATOR_URL = "http://localhost:8080/actuator/health";

export function registerSystemHealth(server: McpServer) {
    server.tool(
        "get_system_health",
        {},
        async () => {
            try {
                const response = await axios.get(ACTUATOR_URL);
                return {
                    content: [{ type: "text", text: `System Status: ${response.data.status}\nDetails: ${JSON.stringify(response.data.components || {}, null, 2)}` }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Health check failed: ${error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
