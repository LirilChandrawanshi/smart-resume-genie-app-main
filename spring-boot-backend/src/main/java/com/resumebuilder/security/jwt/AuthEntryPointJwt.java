
package com.resumebuilder.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        logger.error("Unauthorized error: {}", authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        
        // Provide better error message for authentication failures
        String exceptionMessage = authException.getMessage();
        String exceptionClass = authException.getClass().getSimpleName();
        
        // Check if this is a bad credentials or authentication failure
        if (exceptionClass.contains("BadCredentials") || 
            exceptionClass.contains("Authentication") ||
            (exceptionMessage != null && (exceptionMessage.contains("Bad credentials") || 
                                         exceptionMessage.contains("authentication")))) {
            body.put("message", "Error: Invalid username or password!");
        } else {
            body.put("message", exceptionMessage != null ? exceptionMessage : "Full authentication is required to access this resource");
        }
        body.put("path", request.getServletPath());

        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), body);
    }
}
