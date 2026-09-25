import PageShell from "@/components/layout/PageShell";
import TopicDetail from "@/components/layout/TopicDetail";

export default function ComplaintsTopicPage() {
  return (
    <PageShell>
      <TopicDetail
        title="Complaint Letters"
        intro="How to write a clear, formal complaint letter that gets a response — for services, goods, or public offices."
        lawPoints={[
          "A written complaint creates evidence of when and what you raised.",
          "Many statutory processes start only after a written complaint.",
          "Letters should identify the parties, facts, and the remedy requested.",
          "Keep proof of delivery (email receipt or registered post).",
        ]}
        steps={[
          "State the facts clearly with dates and reference numbers.",
          "Specify the remedy you want and a reasonable deadline.",
          "Keep a copy of the letter and any replies.",
          "Escalate to the relevant authority if there is no response.",
        ]}
        documents={["Complaint letter", "Request for refund letter", "Demand letter"]}
        help="The relevant regulator, commission, or ombudsman for your issue, or a licensed advocate."
      />
    </PageShell>
  );
}
