# How AI Suggestions Are Managed

## Overview

The app uses **AiSuggestions.tsx** + **atsSuggestions.ts** to generate ATS-friendly suggestions and **Index.tsx** to apply them to resume state. Not all suggestion types currently update the resume when you click "Apply".

---

## 1. Where suggestions come from

**File: `src/lib/atsSuggestions.ts`**

- **ATS score**: `calculateATSScore(resumeData)` — rule-based and/or dataset-based (Hugging Face `resume-ats-score-v1-en`).
- **Suggestions**: `generateATSSuggestions(resumeData)` can produce:
  - **Dataset-based** (if dataset is available): `field: 'dataset-pattern-0'`, etc., with generic advice text.
  - **Summary**: `field: 'summary'` — missing/short or too long summary.
  - **Skill**: `field: 'skill'` — add a suggested technical skill.
  - **Experience**: `field: 'experience-{index}-description'` — improve a specific experience description.
  - **Education**: `field: 'education-{index}'` — complete education (advice only).
  - **Format**: `field: 'format'` — e.g. email format (advice only).
  - **Keyword**: `field: 'keyword'` — add more keywords (advice only).

Optional AI: if `VITE_HF_TOKEN` is set, summary and experience text can be generated via Hugging Face Router API; otherwise rule-based fallbacks are used.

---

## 2. What happens when you click "Apply"

**File: `src/components/AiSuggestions.tsx` — `handleApplySuggestion(index)`**

- Reads `suggestion.field` and `suggestion.value`.
- Calls parent only for these cases:
  - `field === 'summary'` → `onApplySuggestion('summary', value)`
  - `field === 'skill'` → `onApplySuggestion('newSkill', value)`
  - `field` starts with `'experience-'` → `onApplySuggestion('experience-{index}-description', value)`
- For **all** suggestions (including education, format, keyword, dataset-pattern) it always:
  - Marks the suggestion as applied.
  - Shows toast: "Suggestion applied".

So for education, format, keyword, and dataset-pattern, **nothing is sent to the parent** and the resume state is **not** updated, but the UI still says "applied".

---

## 3. How the parent applies them to the resume

**File: `src/pages/Index.tsx` — `handleApplySuggestion(field, value)`**

- **`field === 'summary'`**  
  Updates `resumeData.personalInfo.summary` with `value`.  
  → **Correctly applied.**

- **`field === 'newSkill'`**  
  Appends a new skill: `{ id, name: value, level: '80' }`.  
  → **Correctly applied.**

- **`field.startsWith('experience-')` and `parts[2] === 'description'`**  
  Updates `resumeData.experience[expIndex].description` with `value`.  
  → **Correctly applied.**

- **Any other `field`** (e.g. `education-0`, `format`, `keyword`, `dataset-pattern-0`)  
  No branch in `handleApplySuggestion` → **not applied**; only the suggestion UI and toast change.

---

## 4. Summary: what applies and what doesn’t

| Suggestion type   | Field example              | Actually updates resume? | Notes                          |
|-------------------|----------------------------|---------------------------|--------------------------------|
| Summary           | `summary`                  | Yes                       |                                |
| Add skill         | `skill` → `newSkill`       | Yes                       |                                |
| Experience desc   | `experience-0-description` | Yes                       |                                |
| Education         | `education-0`              | No                        | Advice only, no apply handler  |
| Format            | `format`                   | No                        | Advice only                    |
| Keyword           | `keyword`                  | No                        | Advice only                    |
| Dataset pattern   | `dataset-pattern-0`        | No                        | Generic text, no apply handler  |

So: **summary, new skill, and experience description** are the only suggestion types that are correctly applied; education, format, keyword, and dataset-pattern are not, and the "Apply" button currently marks them as applied without changing the resume.
