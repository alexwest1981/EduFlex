
import { z } from "zod";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const API_Base = process.env.EDUFLEX_API_URL || "http://localhost:8080/api";
const ADMIN_TOKEN = process.env.EDUFLEX_ADMIN_TOKEN || "";

export function registerListCourses(server: McpServer) {
    server.tool(
        "list_courses",
        {
            limit: z.number().default(10).describe("Number of courses to return"),
        },
        async ({ limit }) => {
            try {
                const response = await axios.get(`${API_Base}/courses`, {
                    headers: {
                        "Authorization": `Bearer ${ADMIN_TOKEN}`,
                        "X-Tenant-ID": "default" // Assuming default tenant for now
                    },
                    params: { size: limit }
                });

                const courses = response.data.content || response.data;
                const formatted = courses.map((c: any) =>
                    `[${c.id}] ${c.title || c.name} (Teacher: ${c.teacher?.firstName || 'Unknown'})`
                ).join("\n");

                return {
                    content: [{ type: "text", text: `Found Courses:\n${formatted}` }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Error fetching courses: ${error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
