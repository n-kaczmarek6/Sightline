import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlign,
  AlignmentType,
} from "docx";

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
const RULE_COLOR = "D8E4E0";

function isBulletLine(line) {
  return line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
}

function sectionHeading(title) {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, color: "0EA98B", size: 17 })],
    alignment: AlignmentType.CENTER,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE_COLOR, space: 4 } },
    spacing: { before: 260, after: 110 },
  });
}

function sectionParagraphs(title, text) {
  if (!text || !text.trim()) return [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return [
    sectionHeading(title),
    ...lines.map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line, bold: !isBulletLine(line) })],
          spacing: { before: !isBulletLine(line) ? 100 : 0, after: 60 },
        })
    ),
  ];
}

function inlineListParagraph(text) {
  if (!text || !text.trim()) return null;
  const items = text.split(/[,·|\n]/).map((s) => s.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return new Paragraph({ text: items.join(" – "), spacing: { after: 40 } });
}

function inlineListSectionParagraphs(title, text) {
  const list = inlineListParagraph(text);
  if (!list) return [];
  return [sectionHeading(title), list];
}

function headerParagraphs(data) {
  return [
    new Paragraph({
      children: [new TextRun({ text: data.name, bold: true, size: 40 })],
    }),
    new Paragraph({
      children: [new TextRun({ text: data.label, color: "0EA98B", size: 18, allCaps: true })],
      spacing: { after: 40 },
    }),
    data.contact
      ? new Paragraph({
          children: [new TextRun({ text: data.contact, color: "5E6B64", size: 18 })],
          spacing: { after: 80 },
        })
      : new Paragraph({ text: "" }),
  ];
}

function buildHeader(data) {
  if (!data.avatarBuffer) return headerParagraphs(data);

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { ...NO_BORDERS, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              borders: NO_BORDERS,
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: data.avatarBuffer,
                      // Seitenverhältnis passend zum Crop-Tool (components/AvatarCropModal.js),
                      // das Foto bereits oval mit transparenten Ecken liefert.
                      transformation: { width: 64, height: 83 },
                      type: data.avatarDocxType || "png",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 78, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              borders: NO_BORDERS,
              children: headerParagraphs(data),
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { after: 40 } }),
  ];
}

export async function generateDocx(data) {
  const doc = new Document({
    sections: [
      {
        children: [
          ...buildHeader(data),
          ...sectionParagraphs(data.labels.summary, data.summary),
          ...sectionParagraphs(data.labels.experience, data.experience),
          ...inlineListSectionParagraphs(data.labels.skills, data.skills),
          ...sectionParagraphs(data.labels.education, data.education),
          ...sectionParagraphs(data.labels.achievements, data.achievements),
          ...inlineListSectionParagraphs(data.labels.languages, data.languages),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
