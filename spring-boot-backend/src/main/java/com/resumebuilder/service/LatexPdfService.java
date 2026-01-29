package com.resumebuilder.service;

import com.resumebuilder.model.Resume;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Compiles substituted LaTeX to PDF by running pdflatex in a subprocess.
 * Requires pdflatex on the system PATH or path configured in resumebuilder.latex.pdflatex-path.
 */
@Service
public class LatexPdfService {

    private final LatexTemplateService latexTemplateService;

    @Value("${resumebuilder.latex.pdflatex-path:pdflatex}")
    private String pdflatexPath;

    @Value("${resumebuilder.latex.enabled:true}")
    private boolean latexEnabled;

    public LatexPdfService(LatexTemplateService latexTemplateService) {
        this.latexTemplateService = latexTemplateService;
    }

    /**
     * Generates PDF bytes for the given resume using the given LaTeX template id.
     * Returns null if template not found, LaTeX not enabled, or compilation fails.
     */
    public byte[] generatePdf(Resume resume, String templateId) throws IOException {
        if (!latexEnabled || templateId == null || templateId.isBlank()) return null;
        if (!latexTemplateService.hasTemplate(templateId)) return null;

        String latex = latexTemplateService.loadTemplate(templateId);
        if (latex == null) return null;
        String substituted = latexTemplateService.substitute(resume, latex);

        Path dir = Files.createTempDirectory("resume-latex-");
        String baseName = "resume";
        Path texFile = dir.resolve(baseName + ".tex");
        try {
            Files.writeString(texFile, substituted, StandardCharsets.UTF_8);
            int exitCode = runPdflatex(dir, baseName);
            if (exitCode != 0) return null;
            Path pdfFile = dir.resolve(baseName + ".pdf");
            if (!Files.isRegularFile(pdfFile)) return null;
            return Files.readAllBytes(pdfFile);
        } finally {
            try {
                Files.walk(dir).sorted((a, b) -> b.compareTo(a)).forEach(p -> {
                    try { Files.deleteIfExists(p); } catch (IOException ignored) {}
                });
            } catch (Exception ignored) {}
        }
    }

    private int runPdflatex(Path workDir, String baseName) throws IOException {
        List<String> cmd = new ArrayList<>();
        cmd.add(pdflatexPath);
        cmd.add("-interaction=nonstopmode");
        cmd.add("-halt-on-error");
        cmd.add(baseName + ".tex");
        ProcessBuilder pb = new ProcessBuilder(cmd)
                .directory(workDir.toFile())
                .redirectErrorStream(true);
        Process p = pb.start();
        try {
            boolean finished = p.waitFor(60, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                return -1;
            }
            return p.exitValue();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            p.destroyForcibly();
            return -1;
        }
    }

    public boolean isLatexEnabled() {
        return latexEnabled;
    }
}
