
package com.resumebuilder.controller;

import com.resumebuilder.model.Resume;
import com.resumebuilder.payload.response.MessageResponse;
import com.resumebuilder.repository.ResumeRepository;
import com.resumebuilder.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {
    @Autowired
    ResumeRepository resumeRepository;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Resume>> getAllResumes() {
        String userId = getCurrentUserId();
        List<Resume> resumes = resumeRepository.findByUserId(userId);
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getResumeById(@PathVariable String id) {
        String userId = getCurrentUserId();
        
        Optional<Resume> resumeData = resumeRepository.findById(id);
        
        if (resumeData.isPresent()) {
            Resume resume = resumeData.get();
            
            // Check if the resume belongs to the current user
            if (!resume.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(new MessageResponse("You don't have permission to access this resume"));
            }
            
            return ResponseEntity.ok(resume);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Resume> createResume(@RequestBody Resume resume) {
        String userId = getCurrentUserId();
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        
        resume.setUserId(userId);
        resume.setCreatedAt(currentTime);
        resume.setUpdatedAt(currentTime);
        
        // Set default template if not provided
        if (resume.getTemplate() == null || resume.getTemplate().isEmpty()) {
            resume.setTemplate("default");
        }
        
        Resume savedResume = resumeRepository.save(resume);
        return ResponseEntity.ok(savedResume);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateResume(@PathVariable String id, @RequestBody Resume resume) {
        String userId = getCurrentUserId();
        
        Optional<Resume> resumeData = resumeRepository.findById(id);
        
        if (resumeData.isPresent()) {
            Resume existingResume = resumeData.get();
            
            // Check if the resume belongs to the current user
            if (!existingResume.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(new MessageResponse("You don't have permission to update this resume"));
            }
            
            // Update fields
            existingResume.setName(resume.getName());
            existingResume.setPersonalInfo(resume.getPersonalInfo());
            existingResume.setExperience(resume.getExperience());
            existingResume.setEducation(resume.getEducation());
            existingResume.setSkills(resume.getSkills());
            existingResume.setProjects(resume.getProjects());
            existingResume.setAchievements(resume.getAchievements());
            existingResume.setTemplate(resume.getTemplate());
            existingResume.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            Resume updatedResume = resumeRepository.save(existingResume);
            return ResponseEntity.ok(updatedResume);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteResume(@PathVariable String id) {
        String userId = getCurrentUserId();
        
        Optional<Resume> resumeData = resumeRepository.findById(id);
        
        if (resumeData.isPresent()) {
            Resume existingResume = resumeData.get();
            
            // Check if the resume belongs to the current user
            if (!existingResume.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(new MessageResponse("You don't have permission to delete this resume"));
            }
            
            resumeRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Resume deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/templates")
    public ResponseEntity<List<String>> getAvailableTemplates() {
        // Return a list of available templates
        List<String> templates = List.of("modern", "professional", "creative", "minimal", "executive");
        return ResponseEntity.ok(templates);
    }
}
