
package com.resumebuilder.controller;

import com.resumebuilder.model.Resume;
import com.resumebuilder.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/pdf")
public class PdfController {
    
    @Autowired
    ResumeRepository resumeRepository;
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> generatePdf(@PathVariable String id) {
        Optional<Resume> resumeData = resumeRepository.findById(id);
        
        if (resumeData.isPresent()) {
            // In a real implementation, you would use a PDF library like iText or PDFBox
            // to generate the PDF server-side. For now, we'll just return a placeholder response.
            
            return ResponseEntity.status(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(resumeData.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Resume not found");
        }
    }
}
