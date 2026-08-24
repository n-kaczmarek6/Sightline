import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

function sectionParagraphs(title, text) {
  if (!text || !text.trim()) return [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 } }),
    ...lines.map((line) => new Paragraph({ text: line, spacing: { after: 60 } })),
  ];
}

export async function generateDocx(data) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: data.name, bold: true, size: 44 })],
          }),
          data.contact
            ? new Paragraph({
                children: [new TextRun({ text: data.contact, color: "5E6B64", size: 20 })],
                spacing: { after: 80 },
              })
            : new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: data.label, color: "0EA98B", size: 18, allCaps: true })],
            spacing: { after: 120 },
          }),
          ...sectionParagraphs(data.labels.summary, data.summary),
          ...sectionParagraphs(data.labels.experience, data.experience),
          ...sectionParagraphs(data.labels.education, data.education),
          ...sectionParagraphs(data.labels.skills, data.skills),
          ...sectionParagraphs(data.labels.achievements, data.achievements),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
