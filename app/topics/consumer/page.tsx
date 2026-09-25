import PageShell from "@/components/layout/PageShell";
import TopicDetail from "@/components/layout/TopicDetail";

export default function ConsumerTopicPage() {
  return (
    <PageShell>
      <TopicDetail
        title="Consumer Rights"
        intro="What Kenyan consumers are entitled to when buying goods and services, and how to complain when things go wrong."
        lawPoints={[
          "Consumers have the right to goods and services that are safe, of acceptable quality, and as described.",
          "Faulty goods may entitle you to repair, replacement, or refund.",
          "Unfair or misleading business practices are prohibited.",
          "Contracts that strip consumers of basic rights may be unenforceable.",
        ]}
        steps={[
          "Keep receipts, warranties, and evidence of the problem.",
          "Contact the seller in writing and state the remedy you want.",
          "Send a formal complaint or refund request letter.",
          "Escalate to the Competition Authority of Kenya or seek legal help.",
        ]}
        documents={[
          "Request for refund letter",
          "Complaint letter",
          "Demand letter",
        ]}
        help="Competition Authority of Kenya, the county consumer protection office, or a licensed advocate."
      />
    </PageShell>
  );
}
