import fs from 'node:fs/promises';
import path from 'node:path';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

const root = process.cwd();
const inputPath = path.join(root, 'docs', 'interview-qa.md');
const outputPath = path.join(root, 'docs', 'Smart-Resume-Genie-Interview-QA.docx');

function addTextRunsFromInlineMarkdown(text) {
  const runs = [];
  const parts = text.split(/(`[^`]+`)/g).filter(Boolean);
  for (const part of parts) {
    if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New' }));
    } else {
      runs.push(new TextRun(part));
    }
  }
  return runs;
}

function mdToParagraphs(markdown) {
  const lines = markdown.split(/\r?\n/);
  const paragraphs = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: addTextRunsFromInlineMarkdown(line.slice(2)),
        }),
      );
      continue;
    }

    if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 320, after: 160 },
          children: addTextRunsFromInlineMarkdown(line.slice(3)),
        }),
      );
      continue;
    }

    if (line.startsWith('Q: ')) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 180, after: 60 },
          children: [
            new TextRun({ text: 'Q: ', bold: true }),
            ...addTextRunsFromInlineMarkdown(line.slice(3)),
          ],
        }),
      );
      continue;
    }

    if (line.startsWith('A: ')) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'A: ', bold: true }),
            ...addTextRunsFromInlineMarkdown(line.slice(3)),
          ],
        }),
      );
      continue;
    }

    paragraphs.push(
      new Paragraph({
        spacing: { after: 100 },
        children: addTextRunsFromInlineMarkdown(line),
      }),
    );
  }

  return paragraphs;
}

async function main() {
  const markdown = await fs.readFile(inputPath, 'utf8');
  const doc = new Document({
    creator: 'OpenAI Codex',
    title: 'Smart Resume Genie Interview Q&A',
    description: 'Comprehensive interview preparation document for the Smart Resume Genie project.',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 900,
              right: 900,
            },
          },
        },
        children: mdToParagraphs(markdown),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputPath, buffer);
  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
