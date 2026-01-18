
package com.resumebuilder.controller;

import com.resumebuilder.payload.response.MessageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTemplates() {
        // In a real implementation, these would come from a database
        List<Map<String, Object>> templates = List.of(
            createTemplate("default", "Default", "The standard modern resume template"),
            createTemplate("jake", "Jake", "LaTeX-based academic resume template"),
            createTemplate("modern", "Modern", "A clean, contemporary design with a professional look"),
            createTemplate("professional", "Professional", "Traditional layout perfect for corporate environments"),
            createTemplate("creative", "Creative", "Unique design for creative industries"),
            createTemplate("minimal", "Minimal", "Simple, elegant design with focus on content"),
            createTemplate("executive", "Executive", "Sophisticated design for senior positions")
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("templates", templates);
        response.put("total", templates.size());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTemplateById(@PathVariable String id) {
        // In a real implementation, this would fetch from a database
        List<String> validTemplates = List.of("default", "jake", "modern", "professional", "creative", "minimal", "executive");
        
        if (validTemplates.contains(id)) {
            Map<String, Object> template = createTemplate(id, getTemplateName(id), getTemplateDescription(id));
            
            // For LaTeX templates (like jake), include the LaTeX code
            if ("jake".equals(id)) {
                template.put("latex", getJakeTemplateLatex());
            }
            
            return ResponseEntity.ok(template);
        } else {
            return ResponseEntity.status(404)
                    .body(new MessageResponse("Template not found"));
        }
    }
    
    @GetMapping("/{id}/latex")
    public ResponseEntity<?> getTemplateLatex(@PathVariable String id) {
        if ("jake".equals(id)) {
            Map<String, Object> response = new HashMap<>();
            response.put("id", id);
            response.put("latex", getJakeTemplateLatex());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404)
                    .body(new MessageResponse("Template not found or does not have LaTeX content"));
        }
    }
    
    private Map<String, Object> createTemplate(String id, String name, String description) {
        Map<String, Object> template = new HashMap<>();
        template.put("id", id);
        template.put("name", name);
        template.put("description", description);
        return template;
    }
    
    private String getTemplateName(String id) {
        switch (id) {
            case "default":
                return "Default";
            case "jake":
                return "Jake";
            case "modern":
                return "Modern";
            case "professional":
                return "Professional";
            case "creative":
                return "Creative";
            case "minimal":
                return "Minimal";
            case "executive":
                return "Executive";
            default:
                return id.substring(0, 1).toUpperCase() + id.substring(1);
        }
    }
    
    private String getTemplateDescription(String id) {
        switch (id) {
            case "default":
                return "The standard modern resume template";
            case "jake":
                return "LaTeX-based academic resume template inspired by Jake Gutierrez";
            case "modern":
                return "A clean, contemporary design with a professional look";
            case "professional":
                return "Traditional layout perfect for corporate environments";
            case "creative":
                return "Unique design for creative industries";
            case "minimal":
                return "Simple, elegant design with focus on content";
            case "executive":
                return "Sophisticated design for senior positions";
            default:
                return "Template description for " + id;
        }
    }
    
    private String getJakeTemplateLatex() {
        return "%-------------------------\n" +
               "% Resume in Latex\n" +
               "% Author : Jake Gutierrez\n" +
               "% Based off of: https://github.com/sb2nov/resume\n" +
               "% License : MIT\n" +
               "%------------------------\n" +
               "\n" +
               "\\documentclass[letterpaper,11pt]{article}\n" +
               "\n" +
               "\\usepackage{latexsym}\n" +
               "\\usepackage[empty]{fullpage}\n" +
               "\\usepackage{titlesec}\n" +
               "\\usepackage{marvosym}\n" +
               "\\usepackage[usenames,dvipsnames]{color}\n" +
               "\\usepackage{verbatim}\n" +
               "\\usepackage{enumitem}\n" +
               "\\usepackage[hidelinks]{hyperref}\n" +
               "\\usepackage{fancyhdr}\n" +
               "\\usepackage[english]{babel}\n" +
               "\\usepackage{tabularx}\n" +
               "\\input{glyphtounicode}\n" +
               "\n" +
               "\n" +
               "%----------FONT OPTIONS----------\n" +
               "% sans-serif\n" +
               "% \\usepackage[sfdefault]{FiraSans}\n" +
               "% \\usepackage[sfdefault]{roboto}\n" +
               "% \\usepackage[sfdefault]{noto-sans}\n" +
               "% \\usepackage[default]{sourcesanspro}\n" +
               "\n" +
               "% serif\n" +
               "% \\usepackage{CormorantGaramond}\n" +
               "% \\usepackage{charter}\n" +
               "\n" +
               "\n" +
               "\\pagestyle{fancy}\n" +
               "\\fancyhf{} % clear all header and footer fields\n" +
               "\\fancyfoot{}\n" +
               "\\renewcommand{\\headrulewidth}{0pt}\n" +
               "\\renewcommand{\\footrulewidth}{0pt}\n" +
               "\n" +
               "% Adjust margins\n" +
               "\\addtolength{\\oddsidemargin}{-0.5in}\n" +
               "\\addtolength{\\evensidemargin}{-0.5in}\n" +
               "\\addtolength{\\textwidth}{1in}\n" +
               "\\addtolength{\\topmargin}{-.5in}\n" +
               "\\addtolength{\\textheight}{1.0in}\n" +
               "\n" +
               "\\urlstyle{same}\n" +
               "\n" +
               "\\raggedbottom\n" +
               "\\raggedright\n" +
               "\\setlength{\\tabcolsep}{0in}\n" +
               "\n" +
               "% Sections formatting\n" +
               "\\titleformat{\\section}{\n" +
               "  \\vspace{-4pt}\\scshape\\raggedright\\large\n" +
               "}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]\n" +
               "\n" +
               "% Ensure that generate pdf is machine readable/ATS parsable\n" +
               "\\pdfgentounicode=1\n" +
               "\n" +
               "%-------------------------\n" +
               "% Custom commands\n" +
               "\\newcommand{\\resumeItem}[1]{\n" +
               "  \\item\\small{\n" +
               "    {#1 \\vspace{-2pt}}\n" +
               "  }\n" +
               "}\n" +
               "\n" +
               "\\newcommand{\\resumeSubheading}[4]{\n" +
               "  \\vspace{-2pt}\\item\n" +
               "    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}\n" +
               "      \\textbf{#1} & #2 \\\\\n" +
               "      \\textit{\\small#3} & \\textit{\\small #4} \\\\\n" +
               "    \\end{tabular*}\\vspace{-7pt}\n" +
               "}\n" +
               "\n" +
               "\\newcommand{\\resumeSubSubheading}[2]{\n" +
               "    \\item\n" +
               "    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}\n" +
               "      \\textit{\\small#1} & \\textit{\\small #2} \\\\\n" +
               "    \\end{tabular*}\\vspace{-7pt}\n" +
               "}\n" +
               "\n" +
               "\\newcommand{\\resumeProjectHeading}[2]{\n" +
               "    \\item\n" +
               "    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}\n" +
               "      \\small#1 & #2 \\\\\n" +
               "    \\end{tabular*}\\vspace{-7pt}\n" +
               "}\n" +
               "\n" +
               "\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}\n" +
               "\n" +
               "\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}\n" +
               "\n" +
               "\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}\n" +
               "\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}\n" +
               "\\newcommand{\\resumeItemListStart}{\\begin{itemize}}\n" +
               "\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}\n" +
               "\n" +
               "%-------------------------------------------\n" +
               "%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%\n" +
               "\n" +
               "\n" +
               "\\begin{document}\n" +
               "\n" +
               "%----------HEADING----------\n" +
               "% Template will be populated with user data here\n" +
               "% User's personal information will replace this section\n" +
               "\n" +
               "%-----------EDUCATION-----------\n" +
               "% Template will be populated with user education data\n" +
               "\n" +
               "%-----------EXPERIENCE-----------\n" +
               "% Template will be populated with user experience data\n" +
               "\n" +
               "%-----------PROJECTS-----------\n" +
               "% Template will be populated with user projects data\n" +
               "\n" +
               "%-----------PROGRAMMING SKILLS-----------\n" +
               "% Template will be populated with user skills data\n" +
               "\n" +
               "%-------------------------------------------\n" +
               "\\end{document}\n";
    }
}
