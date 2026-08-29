import { Document, Page, Text, View, Image, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";

// Verhindert, dass react-pdf lange Wörter beim Umbruch automatisch mit Bindestrich
// mitten im Wort trennt (z.B. "Onboard-ing") — sieht wie ein Rendering-Fehler aus.
Font.registerHyphenationCallback((word) => [word]);

const ACCENT = "#0EA98B";
const INK = "#16221E";
const MUTED = "#5E6B64";
const RULE = "#D8E4E0";

const styles = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 34, paddingHorizontal: 38, fontSize: 9.5, fontFamily: "Helvetica", color: INK },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, marginRight: 16 },
  headerText: { flex: 1 },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  label: { fontSize: 9.5, color: ACCENT, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Helvetica-Bold" },
  contactBlock: { alignItems: "flex-end" },
  contactLine: { fontSize: 8.5, color: MUTED, marginBottom: 1.5, textAlign: "right" },
  rule: { borderBottomWidth: 1.5, borderBottomColor: RULE, marginBottom: 10 },
  section: { marginBottom: 7 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  sectionTitleLine: { flex: 1, borderBottomWidth: 1, borderBottomColor: RULE },
  sectionTitleText: { fontSize: 8.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.2, color: ACCENT, marginHorizontal: 8 },
  entryHeader: { marginBottom: 2, fontFamily: "Helvetica-Bold", fontSize: 9.8 },
  bulletLine: { marginBottom: 2, paddingLeft: 8 },
  inlineGrid: { flexDirection: "row", flexWrap: "wrap" },
  inlineGridItem: { width: "50%", fontSize: 9.5, marginBottom: 2.5, paddingRight: 8 },
});

function SectionTitle({ title }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleLine} />
      <Text style={styles.sectionTitleText}>{title}</Text>
      <View style={styles.sectionTitleLine} />
    </View>
  );
}

function TextSection({ title, text }) {
  if (!text || !text.trim()) return null;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <View style={styles.section}>
      <SectionTitle title={title} />
      {lines.map((line, i) => {
        const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
        return (
          <Text key={i} style={isBullet ? styles.bulletLine : styles.entryHeader}>
            {line}
          </Text>
        );
      })}
    </View>
  );
}

function InlineListSection({ title, text }) {
  if (!text || !text.trim()) return null;
  const items = text.split(/[,·|\n]/).map((s) => s.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <View style={styles.section} wrap={false}>
      <SectionTitle title={title} />
      <View style={styles.inlineGrid}>
        {items.map((item, i) => (
          <Text key={i} style={styles.inlineGridItem}>
            – {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

function CvDocument({ data }) {
  const contactParts = (data.contact || "").split(" · ").filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {data.avatarBase64 ? <Image style={styles.avatar} src={data.avatarBase64} /> : null}
          <View style={styles.headerText}>
            <Text style={styles.name}>{data.name}</Text>
            <Text style={styles.label}>{data.label}</Text>
          </View>
          {contactParts.length > 0 && (
            <View style={styles.contactBlock}>
              {contactParts.map((part, i) => (
                <Text key={i} style={styles.contactLine}>{part}</Text>
              ))}
            </View>
          )}
        </View>
        <View style={styles.rule} />
        <TextSection title={data.labels.summary} text={data.summary} />
        <TextSection title={data.labels.experience} text={data.experience} />
        <InlineListSection title={data.labels.skills} text={data.skills} />
        <TextSection title={data.labels.education} text={data.education} />
        <TextSection title={data.labels.achievements} text={data.achievements} />
        <InlineListSection title={data.labels.languages} text={data.languages} />
      </Page>
    </Document>
  );
}

export async function generatePdf(data) {
  return renderToBuffer(<CvDocument data={data} />);
}
