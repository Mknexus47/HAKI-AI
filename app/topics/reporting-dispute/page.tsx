import PageShell from "@/components/layout/PageShell";
import TopicDetail from "@/components/layout/TopicDetail";

export default function ReportingDisputeTopicPage() {
  return (
    <PageShell>
      <TopicDetail
        title="Reporting a Dispute"
        intro="Where and how to formally report different types of disputes in Kenya, from consumer complaints to neighbour and workplace issues."
        lawPoints={[
          "Many disputes can be resolved without court through negotiation or mediation.",
          "Some matters must be reported to police or a specific tribunal first.",
          "Mediation and arbitration are recognised ways to resolve disputes faster.",
          "Deadlines (limitation periods) apply — acting quickly preserves your options.",
        ]}
        steps={[
          "Write down what happened and collect supporting evidence.",
          "Try to resolve it directly with the other party in writing.",
          "Report or file with the correct body for your dispute type.",
          "If unresolved, consult a licensed advocate before deadlines expire.",
        ]}
        documents={["Complaint letter", "Demand letter", "Service agreement draft"]}
        help="The police for criminal matters, the relevant tribunal or commission for civil matters, or a licensed advocate."
      />
    </PageShell>
  );
}
