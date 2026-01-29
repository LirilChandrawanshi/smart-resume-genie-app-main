package com.resumebuilder.controller;

import com.resumebuilder.model.Resume;
import com.resumebuilder.repository.ResumeRepository;
import com.resumebuilder.service.LatexPdfService;
import com.resumebuilder.service.LatexTemplateService;
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

    @Autowired
    LatexTemplateService latexTemplateService;

    @Autowired
    LatexPdfService latexPdfService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> generatePdf(@PathVariable String id) {
        Optional<Resume> opt = resumeRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resume not found");
        }
        Resume resume = opt.get();
        String templateId = resume.getTemplate() != null ? resume.getTemplate().trim() : null;

        // If resume uses a LaTeX template and LaTeX is enabled, generate PDF server-side
        if (templateId != null && !templateId.isBlank()
                && latexTemplateService.hasTemplate(templateId)
                && latexPdfService.isLatexEnabled()) {
            try {
                byte[] pdf = latexPdfService.generatePdf(resume, templateId);
                if (pdf != null && pdf.length > 0) {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_PDF);
                    headers.setContentLength(pdf.length);
                    String filename = (resume.getPersonalInfo() != null && resume.getPersonalInfo().getName() != null)
                            ? resume.getPersonalInfo().getName().replaceAll("[^a-zA-Z0-9.-]", "_") + ".pdf"
                            : "resume.pdf";
                    headers.setContentDispositionFormData("attachment", filename);
                    return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
                }
            } catch (Exception e) {
                // Fall through to JSON / client-side fallback
            }
        }

        // No LaTeX template or compilation failed: return JSON so frontend can use html2canvas fallback
        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(resume);
    }
}
