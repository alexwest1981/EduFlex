package com.eduflex.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

@RestController
public class OnlyOfficeProxyController {

    private static final Logger logger = LoggerFactory.getLogger(OnlyOfficeProxyController.class);

    @Value("${onlyoffice.internal.url:http://localhost:8081}")
    private String onlyOfficeInternalUrl;

    @RequestMapping(value = {
            "/cache/**",
            "/coauthoring/**",
            "/spellcheck/**",
            "/ConvertService.ashx",
            "/CommandService.ashx"
    })
    public void proxyRequest(HttpServletRequest request, HttpServletResponse response) {
        String path = request.getRequestURI();
        String query = request.getQueryString();
        String targetUrl = onlyOfficeInternalUrl + path + (query != null ? "?" + query : "");

        logger.debug("Proxying OnlyOffice request: {} -> {}", path, targetUrl);

        try {
            URL url = new URI(targetUrl).toURL();
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(request.getMethod());
            connection.setDoInput(true);
            connection.setDoOutput(true);

            // Copy headers
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                // Skip headers that might confuse the connection or are hop-by-hop
                if (headerName.equalsIgnoreCase("Host") ||
                        headerName.equalsIgnoreCase("Content-Length") ||
                        headerName.equalsIgnoreCase("Transfer-Encoding")) {
                    continue;
                }
                connection.setRequestProperty(headerName, request.getHeader(headerName));
            }

            // Copy body if necessary
            if ("POST".equalsIgnoreCase(request.getMethod()) || "PUT".equalsIgnoreCase(request.getMethod())) {
                try (InputStream requestInputStream = request.getInputStream();
                        OutputStream connectionOutputStream = connection.getOutputStream()) {
                    IOUtils.copy(requestInputStream, connectionOutputStream);
                }
            }

            // Set X-Forwarded headers so OnlyOffice knows the real public URL
            connection.setRequestProperty("X-Forwarded-Host", request.getServerName());
            connection.setRequestProperty("X-Forwarded-Proto", request.getScheme());

            // Execute request
            int responseCode = connection.getResponseCode();
            response.setStatus(responseCode);

            // Copy response headers
            Map<String, List<String>> responseHeaders = connection.getHeaderFields();
            for (Map.Entry<String, List<String>> entry : responseHeaders.entrySet()) {
                if (entry.getKey() != null && !entry.getKey().equalsIgnoreCase("Transfer-Encoding")) {
                    for (String value : entry.getValue()) {
                        response.addHeader(entry.getKey(), value);
                    }
                }
            }

            // Copy response body
            try (InputStream connectionInputStream = (responseCode >= 400) ? connection.getErrorStream()
                    : connection.getInputStream();
                    OutputStream responseOutputStream = response.getOutputStream()) {
                if (connectionInputStream != null) {
                    IOUtils.copy(connectionInputStream, responseOutputStream);
                }
            }

        } catch (Exception e) {
            logger.error("Error proxying to OnlyOffice: {}", targetUrl, e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
