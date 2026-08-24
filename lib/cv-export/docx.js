import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
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

function sectionParagraphs(title, text) {
  if (!text || !text.trim()) return [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 } }),
    ...lines.map((line) => new Paragraph({ text: line, spacing: { after: 60 } })),
  ];
}

function headerParagraphs(data) {
  return [
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
              width: { size: 75, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              borders: NO_BORDERS,
              children: headerParagraphs(data),
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              borders: NO_BORDERS,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new ImageRun({
                      data: data.avatarBuffer,
                      transformation: { width: 80, height: 80 },
                      type: data.avatarDocxType || "png",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { after: 80 } }),
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
          ...sectionParagraphs(data.labels.education, data.education),
          ...sectionParagraphs(data.labels.skills, data.skills),
          ...sectionParagraphs(data.labels.languages, data.languages),
          ...sectionParagraphs(data.labels.achievements, data.achievements),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
