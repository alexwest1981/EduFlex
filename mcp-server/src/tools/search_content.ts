
import { z } from "zod";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const API_Base = process.env.EDUFLEX_API_URL || "http://localhost:8080/api";
const ADMIN_TOKEN = process.env.EDUFLEX_ADMIN_TOKEN || "";

export function registerSearchContent(server: McpServer) {
    server.tool(
        "search_content",
        {
            query: z.string().describe("Search query for community content"),
        },
        async ({ query }) => {
            try {
                const response = await axios.get(`${API_Base}/community/search`, {
                    headers: {
                        "Authorization": `Bearer ${ADMIN_TOKEN}`,
                        "X-Tenant-ID": "default"
                    },
                    params: { q: query }
                });

                const items = response.data.content || [];
                const formatted = items.map((i: any) =>
                    `[${i.id}] ${i.title} (${i.contentType}) - Rating: ${i.averageRating}`
                ).join("\n");

                return {
                    content: [{ type: "text", text: items.length > 0 ? `Search Results:\n${formatted}` : "No content found." }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Error searching content: ${error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
