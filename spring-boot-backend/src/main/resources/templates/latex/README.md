# LaTeX Resume Templates

Templates in this folder are used for server-side PDF generation. Each template is a single `.tex` file named by template id (e.g. `jake.tex`). Adding a new template = add a new `.tex` file that uses the placeholder convention below.

## Placeholder convention

The backend substitutes placeholders from the Resume model and escapes LaTeX-special characters.

### Scalar (single-value) placeholders

Use anywhere in the template:

- `{{personalInfo.name}}`
- `{{personalInfo.title}}`
- `{{personalInfo.email}}`
- `{{personalInfo.phone}}`
- `{{personalInfo.location}}`
- `{{personalInfo.summary}}`
- `{{personalInfo.linkedin}}` (e.g. username for linkedin.com/in/username)
- `{{personalInfo.github}}` (e.g. username for github.com/username)

### Repeatable blocks (lists)

Wrap a snippet of LaTeX in `{{#section}} ... {{/section}}`. The snippet is repeated once per item; inside it use per-item placeholders.

**Experience** `{{#experience}} ... {{/experience}}`

Per-item: `{{title}}`, `{{company}}`, `{{location}}`, `{{startDate}}`, `{{endDate}}`, `{{description}}`

**Education** `{{#education}} ... {{/education}}`

Per-item: `{{degree}}`, `{{school}}`, `{{location}}`, `{{startDate}}`, `{{endDate}}`, `{{description}}`

**Skills** `{{#skills}} ... {{/skills}}`

Per-item: `{{name}}`, `{{level}}`

**Projects** `{{#projects}} ... {{/projects}}`

Per-item: `{{name}}`, `{{description}}`, `{{technologies}}`, `{{startDate}}`, `{{endDate}}`, `{{url}}`

**Achievements** `{{#achievements}} ... {{/achievements}}`

Per-item: `{{name}}`, `{{description}}`, `{{technologies}}`, `{{url}}`

### Example (experience block)

```latex
\section{Experience}
\resumeSubHeadingListStart
{{#experience}}
\resumeSubheading{{{title}}}{{{startDate}} -- {{endDate}}}{{{company}}}{{{location}}}
\resumeItem{{{description}}}
{{/experience}}
\resumeSubHeadingListEnd
```

Empty lists are omitted (block output is empty). User content is escaped for LaTeX (`\`, `%`, `&`, `#`, `_`, `{`, `}`) so arbitrary text does not break compilation.
