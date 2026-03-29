/**
 * LatexTemplateImporter
 *
 * Upload UI for importing a LaTeX resume .tex file.
 * Pipeline: upload → parse → show detected config → save to localStorage.
 * The saved template is immediately available in the resume builder.
 */

import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, Trash2, ChevronDown, ChevronUp, ClipboardPaste } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import {
  ParsedTemplate,
  deleteCustomTemplate,
  loadCustomTemplates,
  parseLatexTemplate,
  saveCustomTemplate,
} from '@/lib/latexTemplateParser';

interface Props {
  /** Called after a template is saved so the parent can refresh its template list */
  onTemplateAdded?: (templateId: string) => void;
}

// ─────────────────────────────────────────────
// Parsed config preview row
// ─────────────────────────────────────────────
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center gap-1.5 text-xs">
    <span className="text-muted-foreground min-w-[110px]">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

// ─────────────────────────────────────────────
// Saved template card
// ─────────────────────────────────────────────
const SavedTemplateCard: React.FC<{
  template: ParsedTemplate;
  onDelete: (id: string) => void;
}> = ({ template, onDelete }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: template.accentColor }}
          />
          <span className="text-sm font-medium">{template.name}</span>
          <Badge variant="secondary" className="text-[10px] px-1">Custom</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={() => onDelete(template.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {open && (
        <div className="px-3 py-2 space-y-1 bg-background">
          <Row label="ID" value={<code className="text-[10px]">{template.id}</code>} />
          <Row label="Header" value={template.headerLayout} />
          <Row
            label="Accent color"
            value={
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full border"
                  style={{ backgroundColor: template.accentColor }}
                />
                {template.accentColor}
              </span>
            }
          />
          <Row label="Font" value={template.fontFamily} />
          <Row label="Skills layout" value={template.skillsLayout} />
          <Row label="Section underline" value={template.sectionUnderline ? 'yes' : 'no'} />
          <Row label="Small caps" value={template.sectionSmallCaps ? 'yes' : 'no'} />
          <Row label="Section order" value={template.sectionOrder.join(' → ')} />
          <Row
            label="Imported"
            value={new Date(template.createdAt).toLocaleDateString()}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const LatexTemplateImporter: React.FC<Props> = ({ onTemplateAdded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab: 'upload' | 'paste'
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');

  // Upload state
  const [filename, setFilename] = useState('');
  const [texContent, setTexContent] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [dragging, setDragging] = useState(false);

  // Parse state
  const [parsed, setParsed] = useState<ParsedTemplate | null>(null);
  const [parseError, setParseError] = useState('');

  // Saved templates
  const [savedTemplates, setSavedTemplates] = useState<ParsedTemplate[]>(() =>
    loadCustomTemplates()
  );

  // Active content depending on mode
  const activeContent = inputMode === 'paste' ? pasteContent : texContent;
  const hasContent = activeContent.trim().length > 0;

  // ── File loading ──────────────────────────────
  const loadFile = (file: File) => {
    if (!file.name.endsWith('.tex')) {
      toast.error('Please upload a .tex LaTeX file');
      return;
    }
    const suggestedName = file.name
      .replace(/\.tex$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const suggestedId = file.name
      .replace(/\.tex$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    setFilename(file.name);
    setTemplateName(suggestedName);
    setTemplateId(suggestedId);
    setParsed(null);
    setParseError('');

    const reader = new FileReader();
    reader.onload = (ev) => setTexContent((ev.target?.result as string) ?? '');
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  // ── Drag & drop ──────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, []);

  // ── Parse ────────────────────────────────────
  const handleParse = () => {
    if (!activeContent.trim()) {
      toast.error(inputMode === 'paste' ? 'Paste your LaTeX code first' : 'No file loaded');
      return;
    }
    if (!templateName.trim()) { toast.error('Template name is required'); return; }
    if (!templateId.trim()) { toast.error('Template ID is required'); return; }
    try {
      const result = parseLatexTemplate(activeContent, templateId, templateName);
      setParsed(result);
      setParseError('');
    } catch (err) {
      setParseError(String(err));
      toast.error('Failed to parse template');
    }
  };

  // ── Save ─────────────────────────────────────
  const handleSave = () => {
    if (!parsed) return;
    saveCustomTemplate(parsed);
    const refreshed = loadCustomTemplates();
    setSavedTemplates(refreshed);
    toast.success(`"${parsed.name}" template saved — available in the builder now`);
    onTemplateAdded?.(parsed.id);
    // Reset form
    setFilename('');
    setTexContent('');
    setPasteContent('');
    setTemplateName('');
    setTemplateId('');
    setParsed(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Delete ───────────────────────────────────
  const handleDelete = (id: string) => {
    deleteCustomTemplate(id);
    setSavedTemplates(loadCustomTemplates());
    toast.success('Template removed');
  };

  // ─────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Import card ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Import LaTeX Template
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Upload any resume .tex file — the parser extracts colors, layout, section order, and
            typography, then generates a pixel-accurate HTML/CSS preview in the builder.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode tabs */}
          <div className="flex rounded-lg border overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => { setInputMode('upload'); setParsed(null); setParseError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 transition-colors ${
                inputMode === 'upload'
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload .tex file
            </button>
            <button
              type="button"
              onClick={() => { setInputMode('paste'); setParsed(null); setParseError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 transition-colors ${
                inputMode === 'paste'
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground'
              }`}
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Paste LaTeX code
            </button>
          </div>

          {/* Upload mode: drop zone */}
          {inputMode === 'upload' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              {filename ? (
                <p className="text-sm font-medium text-primary">{filename} loaded</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Drop your .tex file here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".tex"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          )}

          {/* Paste mode: textarea */}
          {inputMode === 'paste' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Paste your LaTeX code here</Label>
              <Textarea
                placeholder={`\\documentclass[letterpaper,11pt]{article}\n\\begin{document}\n...\n\\end{document}`}
                className="font-mono text-xs h-52 resize-none"
                value={pasteContent}
                onChange={(e) => {
                  setPasteContent(e.target.value);
                  setParsed(null);
                  setParseError('');
                }}
                spellCheck={false}
              />
              {pasteContent.trim() && (
                <p className="text-xs text-muted-foreground text-right">
                  {pasteContent.length.toLocaleString()} characters
                </p>
              )}
            </div>
          )}

          {/* Name + ID fields */}
          {hasContent && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tmpl-name" className="text-xs">Template Name</Label>
                <Input
                  id="tmpl-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Jake's Resume"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tmpl-id" className="text-xs">
                  Template ID{' '}
                  <span className="text-muted-foreground">(slug, no spaces)</span>
                </Label>
                <Input
                  id="tmpl-id"
                  value={templateId}
                  onChange={(e) =>
                    setTemplateId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                  }
                  placeholder="e.g. jake"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          )}

          {hasContent && (
            <Button onClick={handleParse} variant="outline" className="w-full h-8 text-sm">
              Analyze Template
            </Button>
          )}

          {/* Error */}
          {parseError && (
            <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">
              {parseError}
            </p>
          )}

          {/* Parsed result */}
          {parsed && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold">Template analyzed successfully</span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                <Row label="Header layout" value={parsed.headerLayout} />
                <Row
                  label="Accent color"
                  value={
                    <span className="flex items-center gap-1">
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: parsed.accentColor }}
                      />
                      {parsed.accentColor}
                    </span>
                  }
                />
                <Row label="Font family" value={parsed.fontFamily} />
                <Row label="Skills layout" value={parsed.skillsLayout} />
                <Row label="Section heading size" value={parsed.sectionFontSize} />
                <Row label="Date position" value={parsed.entryDatePosition} />
                <Row label="Section underline" value={parsed.sectionUnderline ? 'yes' : 'no'} />
                <Row label="Small caps" value={parsed.sectionSmallCaps ? 'yes' : 'no'} />
                <Row label="Italic subtitle" value={parsed.entrySubtitleItalic ? 'yes' : 'no'} />
                <Row label="FontAwesome icons" value={parsed.headerShowIcons ? 'yes' : 'no'} />
                <div className="col-span-2">
                  <Row
                    label="Section order"
                    value={
                      <span className="text-xs">{parsed.sectionOrder.join(' → ')}</span>
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full h-9">
                Save & Use This Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Saved custom templates ── */}
      {savedTemplates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Your Custom Templates
              <Badge variant="secondary" className="ml-2 text-xs">{savedTemplates.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {savedTemplates.map((t) => (
              <SavedTemplateCard key={t.id} template={t} onDelete={handleDelete} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LatexTemplateImporter;
