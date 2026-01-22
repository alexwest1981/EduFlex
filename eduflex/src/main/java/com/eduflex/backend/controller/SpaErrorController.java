package com.eduflex.backend.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller to handle Single Page Application (SPA) routing.
 * Forwards 404 errors for non-API/non-static paths to index.html,
 * allowing React Router to handle the route.
 */
@Controller
public class SpaErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());

            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                String path = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
                if (path == null) {
                    path = request.getRequestURI();
                }

                // If it is NOT an API call and NOT a file (has extension)
                // then forward to index.html to let React Router handle it.
                if (path != null &&
                        !path.startsWith("/api") &&
                        !path.startsWith("/uploads") &&
                        !path.startsWith("/actuator") &&
                        !path.contains(".")) {
                    return "forward:/index.html";
                }
            }
        }

        // If it's an API request, we should return null (let Spring handle it as JSON)
        // to avoid "Circular view path" or "View not found" errors that lead to
        // Whitelabel pages.
        String path = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        if (path != null && path.startsWith("/api")) {
            return null;
        }

        // For non-API 404s, we forward to the SPA root
        return "forward:/index.html";
    }
}
