
package com.resumebuilder.controller;

import com.resumebuilder.model.User;
import com.resumebuilder.payload.request.LoginRequest;
import com.resumebuilder.payload.request.SignupRequest;
import com.resumebuilder.payload.response.JwtResponse;
import com.resumebuilder.payload.response.MessageResponse;
import com.resumebuilder.repository.UserRepository;
import com.resumebuilder.security.jwt.JwtUtils;
import com.resumebuilder.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Value("${resumebuilder.seed-admin:false}")
    private boolean seedAdminEnabled;

    /**
     * One-time seed: create or reset admin user (username: admin, password: admin123) with ROLE_USER and ROLE_ADMIN.
     * Only works when resumebuilder.seed-admin=true in application.properties.
     * If admin already exists, resets password to admin123 and ensures roles. After use, set resumebuilder.seed-admin=false and restart.
     */
    @GetMapping("/seed-admin")
    public ResponseEntity<?> seedAdmin() {
        if (!seedAdminEnabled) {
            return ResponseEntity.notFound().build();
        }
        String message;
        if (userRepository.existsByUsername("admin")) {
            User admin = userRepository.findByUsername("admin").orElseThrow();
            admin.setPassword(encoder.encode("admin123"));
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");
            roles.add("ROLE_ADMIN");
            admin.setRoles(roles);
            userRepository.save(admin);
            message = "Admin password reset. Login with username: admin, password: admin123";
        } else {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@resumebuilder.local");
            admin.setPassword(encoder.encode("admin123"));
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");
            roles.add("ROLE_ADMIN");
            admin.setRoles(roles);
            userRepository.save(admin);
            message = "Admin user created. Login with username: admin, password: admin123";
        }
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    roles));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Error: Invalid username or password!"));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Error: Authentication failed - " + e.getMessage()));
        }
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(401)
                .body(new MessageResponse("Error: Invalid username or password!"));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRoles();
        Set<String> roles = new HashSet<>();

        if (strRoles == null) {
            roles.add("ROLE_USER");
        } else {
            strRoles.forEach(role -> {
                roles.add(role);
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
