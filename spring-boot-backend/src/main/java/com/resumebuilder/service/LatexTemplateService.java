package com.resumebuilder.service;

import com.resumebuilder.model.Resume;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Loads LaTeX templates from classpath (templates/latex/{id}.tex),
 * substitutes placeholders from Resume model, and escapes user content for LaTeX.
 */
@Service
public class LatexTemplateService {

    private static final String TEMPLATE_BASE = "templates/latex/";
    private static final String TEMPLATE_SUFFIX = ".tex";

    /**
     * Returns true if a .tex file exists for the given template id.
     */
    public boolean hasTemplate(String templateId) {
        if (templateId == null || templateId.isBlank()) return false;
        String path = TEMPLATE_BASE + templateId.trim() + TEMPLATE_SUFFIX;
        try {
            return new ClassPathResource(path).exists();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Loads template content from classpath. Returns null if not found.
     */
    public String loadTemplate(String templateId) throws IOException {
        if (templateId == null || templateId.isBlank()) return null;
        String path = TEMPLATE_BASE + templateId.trim() + TEMPLATE_SUFFIX;
        ClassPathResource resource = new ClassPathResource(path);
        if (!resource.exists()) return null;
        try (InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /**
     * Substitutes all placeholders in the LaTeX string with data from the resume.
     * Escapes user content for LaTeX. Block placeholders {{#section}}...{{/section}}
     * are expanded per list item.
     */
    public String substitute(Resume resume, String latex) {
        if (latex == null) return "";
        String result = latex;

        // Scalar placeholders from personalInfo
        if (resume.getPersonalInfo() != null) {
            result = replace(result, "{{personalInfo.name}}", resume.getPersonalInfo().getName());
            result = replace(result, "{{personalInfo.title}}", resume.getPersonalInfo().getTitle());
            result = replace(result, "{{personalInfo.email}}", resume.getPersonalInfo().getEmail());
            result = replace(result, "{{personalInfo.phone}}", resume.getPersonalInfo().getPhone());
            result = replace(result, "{{personalInfo.location}}", resume.getPersonalInfo().getLocation());
            result = replace(result, "{{personalInfo.summary}}", resume.getPersonalInfo().getSummary());
            result = replace(result, "{{personalInfo.linkedin}}", resume.getPersonalInfo().getLinkedin());
            result = replace(result, "{{personalInfo.github}}", resume.getPersonalInfo().getGithub());
        }

        // Block: experience
        result = substituteBlock(result, "experience",
                resume.getExperience() != null ? resume.getExperience() : List.of(),
                Map.of(
                        "title", r -> ((Resume.Experience) r).getTitle(),
                        "company", r -> ((Resume.Experience) r).getCompany(),
                        "location", r -> ((Resume.Experience) r).getLocation(),
                        "startDate", r -> ((Resume.Experience) r).getStartDate(),
                        "endDate", r -> ((Resume.Experience) r).getEndDate(),
                        "description", r -> ((Resume.Experience) r).getDescription()
                ),
                Resume.Experience.class);

        // Block: education
        result = substituteBlock(result, "education",
                resume.getEducation() != null ? resume.getEducation() : List.of(),
                Map.of(
                        "degree", r -> ((Resume.Education) r).getDegree(),
                        "school", r -> ((Resume.Education) r).getSchool(),
                        "location", r -> ((Resume.Education) r).getLocation(),
                        "startDate", r -> ((Resume.Education) r).getStartDate(),
                        "endDate", r -> ((Resume.Education) r).getEndDate(),
                        "description", r -> ((Resume.Education) r).getDescription()
                ),
                Resume.Education.class);

        // Block: skills
        result = substituteBlock(result, "skills",
                resume.getSkills() != null ? resume.getSkills() : List.of(),
                Map.of(
                        "name", r -> ((Resume.Skill) r).getName(),
                        "level", r -> ((Resume.Skill) r).getLevel()
                ),
                Resume.Skill.class);

        // Block: projects
        result = substituteBlock(result, "projects",
                resume.getProjects() != null ? resume.getProjects() : List.of(),
                Map.of(
                        "name", r -> ((Resume.Project) r).getName(),
                        "description", r -> ((Resume.Project) r).getDescription(),
                        "technologies", r -> ((Resume.Project) r).getTechnologies(),
                        "startDate", r -> ((Resume.Project) r).getStartDate(),
                        "endDate", r -> ((Resume.Project) r).getEndDate(),
                        "url", r -> ((Resume.Project) r).getUrl()
                ),
                Resume.Project.class);

        // Block: achievements
        result = substituteBlock(result, "achievements",
                resume.getAchievements() != null ? resume.getAchievements() : List.of(),
                Map.of(
                        "name", r -> ((Resume.Achievement) r).getName(),
                        "description", r -> ((Resume.Achievement) r).getDescription(),
                        "technologies", r -> ((Resume.Achievement) r).getTechnologies(),
                        "url", r -> ((Resume.Achievement) r).getUrl()
                ),
                Resume.Achievement.class);

        return result;
    }

    @SuppressWarnings("unchecked")
    private <T> String substituteBlock(String latex, String sectionName, List<T> items,
                                       Map<String, java.util.function.Function<Object, String>> fieldGetters,
                                       Class<T> itemType) {
        String openTag = "{{#" + sectionName + "}}";
        String closeTag = "{{/" + sectionName + "}}";
        while (latex.contains(openTag)) {
            int start = latex.indexOf(openTag);
            int blockStart = start + openTag.length();
            int end = latex.indexOf(closeTag, blockStart);
            if (end == -1) break;
            String blockTemplate = latex.substring(blockStart, end);
            StringBuilder replacement = new StringBuilder();
            for (Object item : items) {
                String block = blockTemplate;
                for (Map.Entry<String, java.util.function.Function<Object, String>> e : fieldGetters.entrySet()) {
                    String placeholder = "{{" + e.getKey() + "}}";
                    String value = e.getValue().apply(item);
                    block = replace(block, placeholder, value);
                }
                replacement.append(block);
            }
            latex = latex.substring(0, start) + replacement + latex.substring(end + closeTag.length());
        }
        return latex;
    }

    private String replace(String text, String placeholder, String value) {
        if (value == null) value = "";
        return text.replace(placeholder, escapeLatex(value));
    }

    /**
     * Escapes LaTeX-special characters in user content so it does not break compilation.
     */
    public static String escapeLatex(String s) {
        if (s == null) return "";
        return s
                .replace("\\", "\\textbackslash{}")
                .replace("&", "\\&")
                .replace("%", "\\%")
                .replace("#", "\\#")
                .replace("_", "\\_")
                .replace("{", "\\{")
                .replace("}", "\\}");
    }
}
