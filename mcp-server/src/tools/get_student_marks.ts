import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerGetStudentMarks(server: McpServer) {
    server.tool(
        "get_student_marks",
        "Fetch all grades and quiz results for a specific student across all courses.",
        {
            studentId: z.number().describe("The internal ID of the student"),
        },
        async ({ studentId }) => {
            const API_BASE = process.env.EDUFLEX_API_URL || "http://localhost:8080/api";

            try {
                const response = await fetch(`${API_BASE}/analytics/student/${studentId}`);
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                // Format for AI consumption
                const summary = data.map((course: any) => ({
                    course: course.courseName,
                    assignments: `${course.completedAssignments}/${course.totalAssignments}`,
                    quizzes: `${course.completedQuizzes}/${course.totalQuizzes}`,
                    estimatedGrade: course.estimatedGrade,
                    recentResults: course.recentResults.map((r: any) => `${r.title}: ${r.scoreOrGrade}`).join(", ")
                }));

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(summary, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to fetch student marks: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
