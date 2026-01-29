package com.resumebuilder.controller;

import com.resumebuilder.model.Resume;
import com.resumebuilder.model.User;
import com.resumebuilder.payload.request.AdminRolesRequest;
import com.resumebuilder.payload.response.AdminPageResponse;
import com.resumebuilder.payload.response.AdminResumeResponse;
import com.resumebuilder.payload.response.AdminStatsExtendedResponse;
import com.resumebuilder.payload.response.AdminStatsResponse;
import com.resumebuilder.payload.response.AdminUserResponse;
import com.resumebuilder.payload.response.MessageResponse;
import com.resumebuilder.repository.ResumeRepository;
import com.resumebuilder.repository.UserRepository;
import com.resumebuilder.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    ResumeRepository resumeRepository;

    private String getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getId();
        }
        return null;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalUsers = userRepository.count();
        long totalResumes = resumeRepository.count();
        return ResponseEntity.ok(new AdminStatsResponse(totalUsers, totalResumes));
    }

    @GetMapping("/stats/extended")
    public ResponseEntity<AdminStatsExtendedResponse> getStatsExtended() {
        long totalUsers = userRepository.count();
        List<Resume> allResumes = resumeRepository.findAll();
        long totalResumes = allResumes.size();
        Map<String, Long> resumesByTemplate = allResumes.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getTemplate() != null && !r.getTemplate().isEmpty() ? r.getTemplate() : "default",
                        Collectors.counting()));
        return ResponseEntity.ok(new AdminStatsExtendedResponse(totalUsers, totalResumes, resumesByTemplate));
    }

    @GetMapping("/users")
    public ResponseEntity<AdminPageResponse<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = (search != null && !search.trim().isEmpty())
                ? userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(search.trim(), search.trim(), pageable)
                : userRepository.findAll(pageable);
        List<User> users = userPage.getContent();
        List<Resume> allResumes = resumeRepository.findAll();
        Map<String, Long> resumeCountByUserId = allResumes.stream()
                .collect(Collectors.groupingBy(Resume::getUserId, Collectors.counting()));
        List<AdminUserResponse> content = users.stream()
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRoles(),
                        resumeCountByUserId.getOrDefault(user.getId(), 0L)
                ))
                .collect(Collectors.toList());
        AdminPageResponse<AdminUserResponse> response = new AdminPageResponse<>(
                content,
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.getNumber());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/resumes")
    public ResponseEntity<AdminPageResponse<AdminResumeResponse>> getResumes(
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Resume> resumePage = (userId != null && !userId.isBlank())
                ? resumeRepository.findByUserId(userId, pageable)
                : resumeRepository.findAll(pageable);
        List<Resume> resumes = resumePage.getContent();
        List<User> allUsers = userRepository.findAll();
        Map<String, String> usernameByUserId = allUsers.stream()
                .collect(Collectors.toMap(User::getId, User::getUsername, (a, b) -> a));
        List<AdminResumeResponse> content = resumes.stream()
                .map(r -> new AdminResumeResponse(
                        r.getId(),
                        r.getName(),
                        r.getUserId(),
                        usernameByUserId.getOrDefault(r.getUserId(), "—"),
                        r.getTemplate() != null ? r.getTemplate() : "default",
                        r.getUpdatedAt() != null ? r.getUpdatedAt() : ""
                ))
                .collect(Collectors.toList());
        AdminPageResponse<AdminResumeResponse> response = new AdminPageResponse<>(
                content,
                resumePage.getTotalElements(),
                resumePage.getTotalPages(),
                resumePage.getNumber());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/resumes/{id}")
    public ResponseEntity<?> getResumeById(@PathVariable String id) {
        return resumeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        String currentUserId = getCurrentUserId();
        if (currentUserId != null && currentUserId.equals(id)) {
            return ResponseEntity.status(403).body(new MessageResponse("You cannot delete your own account."));
        }
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        resumeRepository.deleteByUserId(id);
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully."));
    }

    @DeleteMapping("/resumes/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable String id) {
        if (!resumeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        resumeRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Resume deleted successfully."));
    }

    @PatchMapping("/users/{id}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable String id, @RequestBody AdminRolesRequest request) {
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("At least one role is required."));
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        Set<String> currentRoles = user.getRoles();
        boolean hadAdmin = currentRoles != null && currentRoles.contains("ROLE_ADMIN");
        Set<String> newRoles = new HashSet<>(request.getRoles());
        boolean hasAdmin = newRoles.contains("ROLE_ADMIN");
        if (hadAdmin && !hasAdmin) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRoles() != null && u.getRoles().contains("ROLE_ADMIN"))
                    .count();
            if (adminCount <= 1) {
                return ResponseEntity.badRequest().body(new MessageResponse("Cannot remove the last admin."));
            }
        }
        user.setRoles(newRoles);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Roles updated successfully."));
    }

    @GetMapping(value = "/users/export", produces = "text/csv")
    public ResponseEntity<String> exportUsersCsv() {
        List<User> users = userRepository.findAll();
        List<Resume> allResumes = resumeRepository.findAll();
        Map<String, Long> resumeCountByUserId = allResumes.stream()
                .collect(Collectors.groupingBy(Resume::getUserId, Collectors.counting()));
        StringBuilder csv = new StringBuilder();
        csv.append("id,username,email,roles,resumeCount\n");
        for (User u : users) {
            String roles = u.getRoles() != null ? String.join(";", u.getRoles()) : "";
            long count = resumeCountByUserId.getOrDefault(u.getId(), 0L);
            csv.append(escapeCsv(u.getId())).append(",")
                    .append(escapeCsv(u.getUsername())).append(",")
                    .append(escapeCsv(u.getEmail())).append(",")
                    .append(escapeCsv(roles)).append(",")
                    .append(count).append("\n");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "users.csv");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }

    @GetMapping(value = "/resumes/export", produces = "text/csv")
    public ResponseEntity<String> exportResumesCsv(@RequestParam(required = false) String userId) {
        List<Resume> resumes = (userId != null && !userId.isBlank())
                ? resumeRepository.findByUserId(userId)
                : resumeRepository.findAll();
        List<User> allUsers = userRepository.findAll();
        Map<String, String> usernameByUserId = allUsers.stream()
                .collect(Collectors.toMap(User::getId, User::getUsername, (a, b) -> a));
        StringBuilder csv = new StringBuilder();
        csv.append("id,name,userId,ownerUsername,template,updatedAt\n");
        for (Resume r : resumes) {
            String owner = usernameByUserId.getOrDefault(r.getUserId(), "—");
            csv.append(escapeCsv(r.getId())).append(",")
                    .append(escapeCsv(r.getName())).append(",")
                    .append(escapeCsv(r.getUserId())).append(",")
                    .append(escapeCsv(owner)).append(",")
                    .append(escapeCsv(r.getTemplate() != null ? r.getTemplate() : "default")).append(",")
                    .append(escapeCsv(r.getUpdatedAt() != null ? r.getUpdatedAt() : "")).append("\n");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "resumes.csv");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }

    private static String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
