package com.resumebuilder.controller;

import com.resumebuilder.service.LatexTemplateService;
import com.resumebuilder.payload.response.MessageResponse;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final LatexTemplateService latexTemplateService;
    private final ResourcePatternResolver resourcePatternResolver;

    private static final List<Map<String, Object>> HTML_ONLY_TEMPLATES = List.of(
            createTemplate("default", "Default", "The standard modern resume template", false),
            createTemplate("modern", "Modern", "A clean, contemporary design with a professional look", false),
            createTemplate("professional", "Professional", "Traditional layout perfect for corporate environments", false),
            createTemplate("creative", "Creative", "Unique design for creative industries", false),
            createTemplate("minimal", "Minimal", "Simple, elegant design with focus on content", false),
            createTemplate("executive", "Executive", "Sophisticated design for senior positions", false)
    );

    public TemplateController(LatexTemplateService latexTemplateService,
                             ResourcePatternResolver resourcePatternResolver) {
        this.latexTemplateService = latexTemplateService;
        this.resourcePatternResolver = resourcePatternResolver;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTemplates() {
        Set<String> latexIds = discoverLatexTemplateIds();
        List<Map<String, Object>> templates = new ArrayList<>();

        for (Map<String, Object> t : HTML_ONLY_TEMPLATES) {
            String id = (String) t.get("id");
            if (!latexIds.contains(id)) {
                templates.add(t);
            }
        }
        for (String id : latexIds.stream().sorted().collect(Collectors.toList())) {
            templates.add(createTemplate(id, getTemplateName(id), getTemplateDescription(id), true));
        }
        // Sort so "default" stays first, then by id
        templates.sort(Comparator.comparing((Map<String, Object> m) -> "default".equals(m.get("id")) ? "" : (String) m.get("id")));

        Map<String, Object> response = new HashMap<>();
        response.put("templates", templates);
        response.put("total", templates.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTemplateById(@PathVariable String id) {
        if (latexTemplateService.hasTemplate(id)) {
            Map<String, Object> template = createTemplate(id, getTemplateName(id), getTemplateDescription(id), true);
            try {
                String latex = latexTemplateService.loadTemplate(id);
                if (latex != null) template.put("latex", latex);
            } catch (IOException ignored) {}
            return ResponseEntity.ok(template);
        }
        if (HTML_ONLY_TEMPLATES.stream().anyMatch(t -> id.equals(t.get("id")))) {
            Map<String, Object> template = createTemplate(id, getTemplateName(id), getTemplateDescription(id), false);
            return ResponseEntity.ok(template);
        }
        return ResponseEntity.status(404).body(new MessageResponse("Template not found"));
    }

    @GetMapping("/{id}/latex")
    public ResponseEntity<?> getTemplateLatex(@PathVariable String id) {
        if (!latexTemplateService.hasTemplate(id)) {
            return ResponseEntity.status(404).body(new MessageResponse("Template not found or does not have LaTeX content"));
        }
        try {
            String latex = latexTemplateService.loadTemplate(id);
            if (latex == null) {
                return ResponseEntity.status(404).body(new MessageResponse("Template not found or does not have LaTeX content"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("id", id);
            response.put("latex", latex);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(404).body(new MessageResponse("Template not found or does not have LaTeX content"));
        }
    }

    private Set<String> discoverLatexTemplateIds() {
        Set<String> ids = new HashSet<>();
        try {
            Resource[] resources = resourcePatternResolver.getResources("classpath:templates/latex/*.tex");
            for (Resource r : resources) {
                String filename = r.getFilename();
                if (filename != null && filename.endsWith(".tex")) {
                    ids.add(filename.substring(0, filename.length() - 4));
                }
            }
        } catch (IOException ignored) {}
        return ids;
    }

    private static Map<String, Object> createTemplate(String id, String name, String description, boolean hasLatex) {
        Map<String, Object> template = new HashMap<>();
        template.put("id", id);
        template.put("name", name);
        template.put("description", description);
        template.put("hasLatex", hasLatex);
        return template;
    }

    private String getTemplateName(String id) {
        switch (id) {
            case "default": return "Default";
            case "jake": return "Jake";
            case "modern": return "Modern";
            case "professional": return "Professional";
            case "creative": return "Creative";
            case "minimal": return "Minimal";
            case "executive": return "Executive";
            default: return id.isEmpty() ? id : id.substring(0, 1).toUpperCase() + id.substring(1);
        }
    }

    private String getTemplateDescription(String id) {
        switch (id) {
            case "default": return "The standard modern resume template";
            case "jake": return "LaTeX-based academic resume template inspired by Jake Gutierrez";
            case "modern": return "A clean, contemporary design with a professional look";
            case "professional": return "Traditional layout perfect for corporate environments";
            case "creative": return "Unique design for creative industries";
            case "minimal": return "Simple, elegant design with focus on content";
            case "executive": return "Sophisticated design for senior positions";
            default: return "LaTeX template: " + id;
        }
    }
}
