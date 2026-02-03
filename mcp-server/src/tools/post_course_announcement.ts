import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPostCourseAnnouncement(server: McpServer) {
    server.tool(
        "post_course_announcement",
        "Post an announcement (new thread) to a course forum. Usually for teachers/AI assistants to communicate with students.",
        {
            courseId: z.number().describe("The ID of the course"),
            userId: z.number().describe("The ID of the user (e.g. the AI assistant or teacher) posting the message"),
            title: z.string().describe("Announcement title"),
            content: z.string().describe("The message body"),
        },
        async ({ courseId, userId, title, content }) => {
            const API_BASE = process.env.EDUFLEX_API_URL || "http://localhost:8080/api";

            try {
                // 1. Get categories to find the "Viktig information" or teacher-only one
                const catRes = await fetch(`${API_BASE}/forum/course/${courseId}/categories`);
                if (!catRes.ok) throw new Error("Could not fetch categories");
                const categories = await catRes.json();

                const targetCat = categories.find((c: any) => c.teacherOnly || c.name.toLowerCase().includes("viktig"))
                    || categories[0];

                if (!targetCat) throw new Error("No suitable category found to post in");

                // 2. Post thread
                const postRes = await fetch(`${API_BASE}/forum/category/${targetCat.id}/thread`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: userId.toString(),
                        title,
                        content
                    })
                });

                if (!postRes.ok) throw new Error(`Failed to post message: ${postRes.statusText}`);

                return {
                    content: [
                        {
                            type: "text",
                            text: `Successfully posted announcement: "${title}" in category: ${targetCat.name}`,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to post announcement: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
