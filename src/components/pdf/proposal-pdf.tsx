import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDate, formatMoney } from "@/lib/utils";

type ProposalPdfProps = {
  proposal: {
    title: string;
    summary: string;
    includedScope: string[];
    excludedScope: string[];
    deliverables: string[];
    milestones: string[];
    timeline: string;
    totalPrice: unknown;
    paymentTerms: string;
    validUntil: Date | null;
    notes: string | null;
    client: { name: string; company: string | null; email: string; phone: string | null };
    user: { brandName: string; name: string; email: string; phone: string | null; website: string | null; footerText: string | null; currency: string };
  };
};

const styles = StyleSheet.create({
  page: { padding: 42, fontSize: 10, color: "#17202a", lineHeight: 1.5 },
  header: { borderBottomWidth: 1, borderColor: "#d9e2ec", paddingBottom: 18, marginBottom: 24, flexDirection: "row", justifyContent: "space-between" },
  brand: { color: "#0f766e", fontSize: 12, fontWeight: 700 },
  title: { fontSize: 24, fontWeight: 700, marginTop: 10, maxWidth: 360 },
  muted: { color: "#64748b" },
  section: { marginBottom: 18 },
  h2: { fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#0f172a" },
  paragraph: { marginBottom: 6 },
  row: { flexDirection: "row", gap: 18 },
  col: { flexGrow: 1, flexBasis: 0 },
  box: { backgroundColor: "#0f172a", color: "#ffffff", padding: 16, borderRadius: 6, marginVertical: 16 },
  price: { fontSize: 22, fontWeight: 700 },
  footer: { marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderColor: "#d9e2ec", color: "#64748b", fontSize: 9 },
});

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.paragraph}>
          - {item}
        </Text>
      ))}
    </View>
  );
}

export function ProposalPdf({ proposal }: ProposalPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{proposal.user.brandName}</Text>
            <Text style={styles.title}>{proposal.title}</Text>
          </View>
          <View>
            <Text>{proposal.client.company || proposal.client.name}</Text>
            <Text style={styles.muted}>{proposal.client.email}</Text>
            <Text style={styles.muted}>{proposal.client.phone || ""}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Resumo</Text>
          <Text>{proposal.summary}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.col}><List title="Escopo incluso" items={proposal.includedScope} /></View>
          <View style={styles.col}><List title="Fora do escopo" items={proposal.excludedScope} /></View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}><List title="Entregáveis" items={proposal.deliverables} /></View>
          <View style={styles.col}><List title="Cronograma" items={proposal.milestones} /></View>
        </View>

        <View style={styles.box}>
          <Text>Investimento total</Text>
          <Text style={styles.price}>{formatMoney(proposal.totalPrice, proposal.user.currency)}</Text>
          <Text>{proposal.paymentTerms}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Prazo e validade</Text>
          <Text>Prazo: {proposal.timeline}</Text>
          <Text>Validade: {formatDate(proposal.validUntil)}</Text>
          {proposal.notes ? <Text>Observações: {proposal.notes}</Text> : null}
        </View>

        <Text style={styles.footer}>
          {proposal.user.footerText || "Proposta demonstrativa gerada pelo HamadFlow Demo."} Data: {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
}
