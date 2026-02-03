import axios from "axios";
const ACTUATOR_URL = "http://localhost:8080/actuator/health";
export function registerSystemHealth(server) {
    server.tool("get_system_health", {}, async () => {
        try {
            const response = await axios.get(ACTUATOR_URL);
            return {
                content: [{ type: "text", text: `System Status: ${response.data.status}\nDetails: ${JSON.stringify(response.data.components || {}, null, 2)}` }],
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Health check failed: ${error.message}` }],
                isError: true,
            };
        }
    });
}
