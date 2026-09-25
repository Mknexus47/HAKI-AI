import PageShell from "@/components/layout/PageShell";
import TopicDetail from "@/components/layout/TopicDetail";

export default function BusinessTopicPage() {
  return (
    <PageShell>
      <TopicDetail
        title="Small Business Agreements"
        intro="What a simple service agreement should include before small businesses in Kenya start working together."
        lawPoints={[
          "A valid agreement needs offer, acceptance, consideration, and lawful purpose.",
          "Key terms — scope, price, timeline, and payment schedule — should be written down.",
          "Both parties should keep a signed copy.",
          "Dispute resolution clauses can save time and cost later.",
        ]}
        steps={[
          "Agree on the scope of work and price in writing.",
          "Draft a simple service agreement covering payment and timelines.",
          "Both parties review and sign the document.",
          "If a dispute arises, send a demand letter before escalating.",
        ]}
        documents={[
          "Business service agreement draft",
          "Demand letter",
          "Complaint letter",
        ]}
        help="A licensed advocate for contract review, or the Small Claims Court for payment disputes within its jurisdiction."
      />
    </PageShell>
  );
}
