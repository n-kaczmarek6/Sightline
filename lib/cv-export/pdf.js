import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const ACCENT = "#0EA98B";
const INK = "#16221E";
const MUTED = "#5E6B64";

const styles = StyleSheet.create({
  page: { padding: 42, fontSize: 10.5, fontFamily: "Helvetica", color: INK },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  contact: { fontSize: 9.5, color: MUTED, marginBottom: 10 },
  label: { fontSize: 9, color: ACCENT, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, color: ACCENT, marginBottom: 6 },
  line: { marginBottom: 3, lineHeight: 1.4 },
});

function Section({ title, text }) {
  if (!text || !text.trim()) return null;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {lines.map((line, i) => (
        <Text key={i} style={styles.line}>{line}</Text>
      ))}
    </View>
  );
}

function CvDocument({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.name}</Text>
        {data.contact ? <Text style={styles.contact}>{data.contact}</Text> : null}
        <Text style={styles.label}>{data.label}</Text>
        <Section title={data.labels.summary} text={data.summary} />
        <Section title={data.labels.experience} text={data.experience} />
        <Section title={data.labels.education} text={data.education} />
        <Section title={data.labels.skills} text={data.skills} />
        <Section title={data.labels.languages} text={data.languages} />
        <Section title={data.labels.achievements} text={data.achievements} />
      </Page>
    </Document>
  );
}

export async function generatePdf(data) {
  return renderToBuffer(<CvDocument data={data} />);
}
