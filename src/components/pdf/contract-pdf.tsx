import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDate, formatMoney } from "@/lib/utils";

type ContractPdfProps = {
  contract: {
    title: string;
    contractorData: string;
    clientData: string;
    object: string;
    scope: string;
    totalPrice: unknown;
    paymentTerms: string;
    deadline: string;
    includedRevisions: number;
    freelancerResponsibilities: string[];
    clientResponsibilities: string[];
    cancellationTerms: string;
    penaltyTerms: string | null;
    rightsAndOwnership: string;
    supportTerms: string;
    additionalClauses: string[];
    legalDisclaimer: string;
    client: { name: string; company: string | null; email: string };
    user: { brandName: string; footerText: string | null; currency: string };
  };
};

const styles = StyleSheet.create({
  page: { padding: 42, fontSize: 10, color: "#17202a", lineHeight: 1.55 },
  header: { borderBottomWidth: 1, borderColor: "#d9e2ec", paddingBottom: 16, marginBottom: 20 },
  brand: { color: "#0f766e", fontSize: 12, fontWeight: 700 },
  title: { fontSize: 22, fontWeight: 700, marginTop: 8 },
  warning: { backgroundColor: "#fef3c7", color: "#78350f", padding: 12, borderRadius: 6, marginBottom: 16 },
  section: { marginBottom: 13 },
  h2: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#0f172a" },
  paragraph: { marginBottom: 4 },
  box: { backgroundColor: "#0f172a", color: "#ffffff", padding: 14, borderRadius: 6, marginVertical: 12 },
  footer: { marginTop: 20, paddingTop: 12, borderTopWidth: 1, borderColor: "#d9e2ec", color: "#64748b", fontSize: 9 },
});

function List({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item) => (
        <Text key={item} style={styles.paragraph}>
          - {item}
        </Text>
      ))}
    </>
  );
}

export function ContractPdf({ contract }: ContractPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>{contract.user.brandName}</Text>
          <Text style={styles.title}>{contract.title}</Text>
        </View>
        <Text style={styles.warning}>{contract.legalDisclaimer}</Text>

        <View style={styles.section}><Text style={styles.h2}>Partes</Text><Text>Contratado: {contract.contractorData}</Text><Text>Contratante: {contract.clientData}</Text></View>
        <View style={styles.section}><Text style={styles.h2}>Objeto</Text><Text>{contract.object}</Text></View>
        <View style={styles.section}><Text style={styles.h2}>Escopo</Text><Text>{contract.scope}</Text></View>
        <View style={styles.box}><Text>Valor: {formatMoney(contract.totalPrice, contract.user.currency)}</Text><Text>Pagamento: {contract.paymentTerms}</Text><Text>Prazo: {contract.deadline}</Text><Text>Revisões inclusas: {contract.includedRevisions}</Text></View>
        <View style={styles.section}><Text style={styles.h2}>Obrigações do contratado</Text><List items={contract.freelancerResponsibilities} /></View>
        <View style={styles.section}><Text style={styles.h2}>Obrigações do contratante</Text><List items={contract.clientResponsibilities} /></View>
        <View style={styles.section}><Text style={styles.h2}>Cancelamento</Text><Text>{contract.cancellationTerms}</Text>{contract.penaltyTerms ? <Text>{contract.penaltyTerms}</Text> : null}</View>
        <View style={styles.section}><Text style={styles.h2}>Direitos de uso e entrega</Text><Text>{contract.rightsAndOwnership}</Text></View>
        <View style={styles.section}><Text style={styles.h2}>Suporte pós-entrega</Text><Text>{contract.supportTerms}</Text></View>
        <View style={styles.section}><Text style={styles.h2}>Cláusulas adicionais</Text><List items={contract.additionalClauses} /></View>
        <Text style={styles.footer}>{contract.user.footerText || "Contrato demonstrativo gerado pelo HamadFlow Demo."} Data: {formatDate(new Date())}</Text>
      </Page>
    </Document>
  );
}
