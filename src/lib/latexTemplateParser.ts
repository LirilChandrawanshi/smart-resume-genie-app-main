/**
 * LaTeX Resume Template Parser
 *
 * Parses a .tex resume file and extracts structural/visual config that drives
 * CustomTemplateRenderer — no code generation, no eval().
 *
 * Usage:
 *   const parsed = parseLatexTemplate(texString, 'my-id', 'My Template');
 *   saveCustomTemplate(parsed);
 */

export type SectionKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'achievements';

export interface ParsedTemplate {
  id: string;
  name: string;

  // Accent / brand color (hex)
  accentColor: string;

  // Header
  headerLayout: 'center' | 'left';
  headerShowIcons: boolean; // fontawesome phone/email/linkedin/github icons
  headerSeparator: '|' | '·' | '•';

  // Section headings
  sectionUppercase: boolean;
  sectionSmallCaps: boolean;
  sectionUnderline: boolean; // horizontal rule under heading
  sectionBold: boolean;
  sectionFontSize: 'sm' | 'base' | 'lg' | 'xl';
  sectionLetterSpacing: 'normal' | 'wide' | 'wider' | 'widest';

  // Entry rows (experience / education / achievements)
  entryDatePosition: 'right' | 'below';
  entrySubtitleItalic: boolean;
  entryBulletStyle: 'bullet' | 'dash';

  /**
   * For experience entries: which field is the bold primary (row 1 left)?
   * 'title' → job title bold, company italic  (Jake original PDF style)
   * 'company' → company bold, title italic
   */
  experiencePrimaryField: 'title' | 'company';

  /**
   * For education entries: what goes on the RIGHT of row 1?
   * 'location' → school + location (row 1), degree + date (row 2)  ← Jake original PDF
   * 'date'     → school + date (row 1), degree + location (row 2)
   */
  educationRow1Right: 'location' | 'date';

  // Skills section layout
  skillsLayout: 'inline-bold' | 'tags' | 'list' | 'progress';

  // Section order as detected from \section{} commands
  sectionOrder: SectionKey[];

  // Typography
  fontFamily: 'sans' | 'serif';

  createdAt: string;
}

// ─────────────────────────────────────────────
// Known LaTeX named colors → hex
// ─────────────────────────────────────────────
const LATEX_NAMED_COLORS: Record<string, string> = {
  black: '#111111',
  white: '#ffffff',
  red: '#cc0000',
  blue: '#0055cc',
  green: '#007700',
  cyan: '#0099aa',
  magenta: '#cc00cc',
  gray: '#666666',
  grey: '#666666',
  darkgray: '#444444',
  darkgrey: '#444444',
  lightgray: '#cccccc',
  NavyBlue: '#001f5b',
  RoyalBlue: '#3a5fc8',
  MidnightBlue: '#1a1a5e',
  ForestGreen: '#1a6b1a',
  OliveGreen: '#4a6b2a',
  BrickRed: '#882222',
  Maroon: '#6b0000',
  Purple: '#6600aa',
  Teal: '#006666',
  CadetBlue: '#4a6e7e',
  BurntOrange: '#cc5500',
  Mahogany: '#661111',
  Plum: '#550055',
  ProcessBlue: '#0080cc',
  SteelBlue: '#3a6f9f',
  SlateBlue: '#5566cc',
};

// ─────────────────────────────────────────────
// Section name → SectionKey
// ─────────────────────────────────────────────
const SECTION_MAP: Record<string, SectionKey> = {
  education: 'education',
  'relevant coursework': 'education',

  experience: 'experience',
  'work experience': 'experience',
  'professional experience': 'experience',
  employment: 'experience',
  'work history': 'experience',

  projects: 'projects',
  project: 'projects',
  'personal projects': 'projects',
  'side projects': 'projects',

  skills: 'skills',
  'technical skills': 'skills',
  'programming skills': 'skills',
  'core competencies': 'skills',
  technologies: 'skills',

  summary: 'summary',
  'professional summary': 'summary',
  objective: 'summary',
  profile: 'summary',
  about: 'summary',

  achievements: 'achievements',
  leadership: 'achievements',
  extracurricular: 'achievements',
  'leadership / extracurricular': 'achievements',
  awards: 'achievements',
  certifications: 'achievements',
  'honors & awards': 'achievements',
  'volunteer experience': 'achievements',
  activities: 'achievements',
};

// ─────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────
export function parseLatexTemplate(
  texContent: string,
  templateId: string,
  templateName: string
): ParsedTemplate {
  const id = templateId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

  return {
    id,
    name: templateName.trim(),
    accentColor: detectAccentColor(texContent),
    headerLayout: detectHeaderLayout(texContent),
    headerShowIcons: /\\fa(Phone|Envelope|Linkedin|Github)/i.test(texContent),
    headerSeparator: detectHeaderSeparator(texContent),
    ...detectSectionHeadingStyle(texContent),
    ...detectEntryStyle(texContent),
    experiencePrimaryField: detectExperiencePrimaryField(texContent),
    educationRow1Right: detectEducationRow1Right(texContent),
    skillsLayout: detectSkillsLayout(texContent),
    sectionOrder: detectSectionOrder(texContent),
    fontFamily: detectFontFamily(texContent),
    createdAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
// Color detection
// ─────────────────────────────────────────────
function detectAccentColor(text: string): string {
  // 1. \definecolor{name}{HTML}{RRGGBB}
  const htmlColorMatch = text.match(
    /\\definecolor\s*\{[^}]+\}\s*\{HTML\}\s*\{([0-9a-fA-F]{6})\}/
  );
  if (htmlColorMatch) return '#' + htmlColorMatch[1];

  // 2. \definecolor{name}{rgb}{r,g,b} (values 0–1)
  const rgbMatch = text.match(
    /\\definecolor\s*\{[^}]+\}\s*\{rgb\}\s*\{([^}]+)\}/
  );
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((s) => Math.round(parseFloat(s.trim()) * 255));
    if (parts.length === 3 && parts.every((v) => !isNaN(v))) {
      return '#' + parts.map((v) => v.toString(16).padStart(2, '0')).join('');
    }
  }

  // 3. \color{name} inside \titleformat
  const titleFormatBlock = extractTitleFormatBlock(text);
  if (titleFormatBlock) {
    const colorInTitle = titleFormatBlock.match(/\\color\{(\w+)\}/);
    if (colorInTitle) {
      const hex = LATEX_NAMED_COLORS[colorInTitle[1]];
      if (hex && hex !== '#111111') return hex; // skip plain black, look for accent
    }
  }

  // 4. Any \textcolor{name} in document body — first colorful hit
  const textColorMatches = [...text.matchAll(/\\(?:text)?color\{([A-Za-z]+)\}/g)];
  for (const m of textColorMatches) {
    const hex = LATEX_NAMED_COLORS[m[1]];
    if (hex && hex !== '#111111' && hex !== '#ffffff') return hex;
  }

  // 5. Default: near-black (most professional resume templates)
  return '#1f2937';
}

// ─────────────────────────────────────────────
// Header layout
// ─────────────────────────────────────────────
function detectHeaderLayout(text: string): 'center' | 'left' {
  const docStart = text.indexOf('\\begin{document}');
  if (docStart === -1) return 'left';
  // Look at the first 800 chars of the body for centering
  const body = text.slice(docStart, docStart + 800);
  if (/\\begin\{center\}|\\centering/.test(body)) return 'center';
  return 'left';
}

// ─────────────────────────────────────────────
// Section heading style
// ─────────────────────────────────────────────
function detectSectionHeadingStyle(text: string): {
  sectionUppercase: boolean;
  sectionSmallCaps: boolean;
  sectionUnderline: boolean;
  sectionBold: boolean;
  sectionFontSize: ParsedTemplate['sectionFontSize'];
  sectionLetterSpacing: ParsedTemplate['sectionLetterSpacing'];
} {
  const block = extractTitleFormatBlock(text) ?? '';

  // \scshape → small caps
  const sectionSmallCaps = /\\scshape/.test(block);

  // \bfseries or \textbf
  const sectionBold = /\\bfseries|\\textbf/.test(block);

  // \uppercase or \MakeUppercase
  const sectionUppercase = /\\uppercase|\\MakeUppercase/.test(block);

  // \titlerule or \hrule in the section definition / after-code
  const sectionUnderline =
    /\\titlerule|\\hrulefill/.test(text.slice(0, text.indexOf('\\begin{document}'))) ||
    /\\titlerule|\\hrulefill/.test(block);

  // Font size
  let sectionFontSize: ParsedTemplate['sectionFontSize'] = 'base';
  if (/\\Large\b/.test(block)) sectionFontSize = 'xl';
  else if (/\\large\b/.test(block)) sectionFontSize = 'lg';
  else if (/\\small\b|\\footnotesize/.test(block)) sectionFontSize = 'sm';

  // Letter spacing (soul package or tracking)
  const sectionLetterSpacing: ParsedTemplate['sectionLetterSpacing'] =
    /\\tracking|\\so\b|letterspace/.test(block) ? 'wider' : 'normal';

  return {
    sectionUppercase,
    sectionSmallCaps,
    sectionUnderline,
    sectionBold,
    sectionFontSize,
    sectionLetterSpacing,
  };
}

// Extract the argument string of \titleformat{\section}{...}[...]
function extractTitleFormatBlock(text: string): string | null {
  const idx = text.indexOf('\\titleformat{\\section}');
  if (idx === -1) return null;
  // Grab the next 400 chars which should cover all arguments
  return text.slice(idx, idx + 400);
}

// ─────────────────────────────────────────────
// Header separator character
// ─────────────────────────────────────────────
function detectHeaderSeparator(text: string): ParsedTemplate['headerSeparator'] {
  // Look inside the header area (before first \section)
  const docStart = text.indexOf('\\begin{document}');
  const firstSection = text.indexOf('\\section');
  const header = text.slice(docStart !== -1 ? docStart : 0, firstSection !== -1 ? firstSection : 1000);

  // ~ (tilde) and \textbar or | in LaTeX → use |
  if (/\\textbar|\btextbar\b|\~.*\\href|~.*~/.test(header)) return '|';
  // cdot or \cdot → ·
  if (/\\cdot|\\textbullet/.test(header)) return '·';
  // default for Jake-style templates is |
  return '|';
}

// ─────────────────────────────────────────────
// Experience primary field detection
// ─────────────────────────────────────────────
function detectExperiencePrimaryField(text: string): 'title' | 'company' {
  // Find the {{#experience}}...{{/experience}} block
  const block =
    text.match(/\{\{#experience\}\}([\s\S]*?)\{\{\/experience\}\}/)?.[1] ?? '';

  // Find \resumeSubheading (or similar) and check which placeholder is first
  const subIdx = block.indexOf('\\resumeSubheading');
  const afterSub = subIdx !== -1 ? block.slice(subIdx, subIdx + 300) : block;

  const titleIdx = afterSub.indexOf('{{title}}');
  const companyIdx = afterSub.indexOf('{{company}}');

  // Whichever placeholder appears first in the subheading call is the primary (bold) field
  if (titleIdx !== -1 && (companyIdx === -1 || titleIdx < companyIdx)) return 'title';
  return 'company';
}

// ─────────────────────────────────────────────
// Education row-1-right field detection
// ─────────────────────────────────────────────
function detectEducationRow1Right(text: string): 'location' | 'date' {
  const block =
    text.match(/\{\{#education\}\}([\s\S]*?)\{\{\/education\}\}/)?.[1] ?? '';

  const subIdx = block.indexOf('\\resumeSubheading');
  if (subIdx === -1) return 'date';

  // The first argument line of \resumeSubheading contains #1 (left) and #2 (right).
  // We look at the characters between the first and second `{...}` pair after \resumeSubheading.
  const afterSub = block.slice(subIdx, subIdx + 300);
  // Extract the content of the second `{...}` which is the right side of row 1
  const row1RightMatch = afterSub.match(/\{[^{}]*\}\s*\{([^{}]*)\}/);
  if (!row1RightMatch) return 'date';
  const row1Right = row1RightMatch[1];

  if (/\{\{location\}\}/.test(row1Right)) return 'location';
  return 'date'; // startDate / endDate
}

// ─────────────────────────────────────────────
// Entry style
// ─────────────────────────────────────────────
function detectEntryStyle(text: string): {
  entryDatePosition: 'right' | 'below';
  entrySubtitleItalic: boolean;
  entryBulletStyle: 'bullet' | 'dash';
} {
  // Date on right if tabular with \extracolsep{\fill} is used
  const entryDatePosition: 'right' | 'below' = /\\extracolsep\{\\fill\}/.test(text)
    ? 'right'
    : 'below';

  // Italic subtitle: \textit or \itshape in \resumeSubheading definition
  const subheadingDef = extractCommandDef(text, 'resumeSubheading');
  const entrySubtitleItalic = /\\textit|\\itshape/.test(subheadingDef);

  // Dash bullets: \textendash or using '–' or '--'
  const entryBulletStyle: 'bullet' | 'dash' = /\\textendash|labelitemi.*textendash/.test(text)
    ? 'dash'
    : 'bullet';

  return { entryDatePosition, entrySubtitleItalic, entryBulletStyle };
}

// Extract the body of \newcommand{\cmdName}[n]{...}
function extractCommandDef(text: string, commandName: string): string {
  const pattern = `\\newcommand{\\${commandName}}`;
  const idx = text.indexOf(pattern);
  if (idx === -1) return '';
  // Find the last `{` and match balanced braces
  return text.slice(idx, idx + 400);
}

// ─────────────────────────────────────────────
// Skills layout
// ─────────────────────────────────────────────
function detectSkillsLayout(text: string): ParsedTemplate['skillsLayout'] {
  // Find skills template block (our placeholder convention)
  const blockMatch = text.match(/\{\{#skills\}\}([\s\S]*?)\{\{\/skills\}\}/);
  const block = blockMatch ? blockMatch[1] : '';

  // Also try to find the Skills section in the document body
  const sectionStart = findSectionBody(text, ['technical skills', 'programming skills', 'skills']);

  const target = block || sectionStart;

  if (/\\textbf/.test(target)) return 'inline-bold';
  if (/\\begin\{multicols\}/.test(target)) return 'tags';
  if (/\\begin\{tabular\}/.test(target)) return 'tags';
  return 'list';
}

function findSectionBody(text: string, sectionNames: string[]): string {
  for (const name of sectionNames) {
    const patterns = [
      `\\section{${name}}`,
      `\\section{${name.replace(/\b\w/g, (c) => c.toUpperCase())}}`,
      `\\section*{${name}}`,
    ];
    for (const pat of patterns) {
      const idx = text.toLowerCase().indexOf(pat.toLowerCase());
      if (idx !== -1) return text.slice(idx, idx + 500);
    }
  }
  return '';
}

// ─────────────────────────────────────────────
// Section order
// ─────────────────────────────────────────────
function detectSectionOrder(text: string): SectionKey[] {
  const docStart = text.indexOf('\\begin{document}');
  const body = docStart !== -1 ? text.slice(docStart) : text;

  const matches = [...body.matchAll(/\\section\*?\{([^}]+)\}/g)];
  const order: SectionKey[] = [];
  const seen = new Set<SectionKey>();

  for (const m of matches) {
    const raw = m[1].toLowerCase().trim();
    const key = SECTION_MAP[raw];
    if (key && !seen.has(key)) {
      order.push(key);
      seen.add(key);
    }
  }

  // Fill in any missing standard sections so nothing is dropped
  const defaults: SectionKey[] = [
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
    'achievements',
  ];
  for (const def of defaults) {
    if (!seen.has(def)) order.push(def);
  }

  return order;
}

// ─────────────────────────────────────────────
// Font family
// ─────────────────────────────────────────────
function detectFontFamily(text: string): 'sans' | 'serif' {
  // Explicit sans-serif packages
  if (/sfdefault|FiraSans|roboto|noto-sans|sourcesanspro/i.test(text)) return 'sans';
  // Explicit serif packages
  if (/CormorantGaramond|charter|Times|Palatino|Garamond|lmodern/i.test(text)) return 'serif';
  // Default: sans (most modern resume templates)
  return 'sans';
}

// ─────────────────────────────────────────────
// LocalStorage helpers
// ─────────────────────────────────────────────
const STORAGE_KEY = 'smart_resume_custom_templates';

export function saveCustomTemplate(template: ParsedTemplate): void {
  const all = loadCustomTemplates().filter((t) => t.id !== template.id);
  all.push(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function loadCustomTemplates(): ParsedTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ParsedTemplate[]) : [];
  } catch {
    return [];
  }
}

export function deleteCustomTemplate(id: string): void {
  const all = loadCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getCustomTemplate(id: string): ParsedTemplate | null {
  return loadCustomTemplates().find((t) => t.id === id) ?? null;
}
