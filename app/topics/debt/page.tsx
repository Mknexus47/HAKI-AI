import PageShell from "@/components/layout/PageShell";
import TopicDetail from "@/components/layout/TopicDetail";

export default function DebtTopicPage() {
  return (
    <PageShell>
      <TopicDetail
        title="Debt Recovery"
        intro="How to formally request repayment of money owed, and the safe steps that normally come before legal action."
        lawPoints={[
          "A debt is enforceable when the amount, parties, and terms can be proved.",
          "A written demand letter creates a formal record and a deadline for payment.",
          "Interest and penalties must be agreed in advance to be claimed.",
          "Recovery actions such as garnishment require a court process.",
        ]}
        steps={[
          "Gather evidence: agreements, messages, and payment records.",
          "Send a demand letter stating the amount and a clear deadline.",
          "Follow up in writing if the deadline passes.",
          "If unresolved, consult a licensed advocate about filing a claim.",
        ]}
        documents={[
          "Demand letter",
          "Loan acknowledgement letter",
          "Request for refund letter",
        ]}
        help="The Small Claims Court for amounts within its jurisdiction, or a licensed advocate of the High Court of Kenya."
      />
    </PageShell>
  );
}
