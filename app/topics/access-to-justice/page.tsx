import PageShell from "@/components/layout/PageShell";
import TopicDetail from "@/components/layout/TopicDetail";

export default function AccessToJusticeTopicPage() {
  return (
    <PageShell>
      <TopicDetail
        title="Access to Justice Basics"
        intro="Understanding the basic pathways to justice in Kenya when you cannot afford a private lawyer."
        lawPoints={[
          "The Constitution guarantees access to justice for everyone.",
          "Legal aid is available for eligible Kenyans through the National Legal Aid Service.",
          "Nongovernmental legal aid organizations offer free advice in some areas.",
          "Courts are required to serve the interests of justice and may hear matters without legal representation.",
        ]}
        steps={[
          "Identify the type of problem and the authority handling it.",
          "Gather documents and write down the timeline of events.",
          "Seek free legal information or legal aid first.",
          "Escalate with professional help if the matter is serious.",
        ]}
        documents={[
          "Complaint letter",
          "Demand letter",
          "Request for refund letter",
        ]}
        help="National Legal Aid Service (NLAS), Fr. Ngeo Justice Centre, Katiba Institute, or a licensed advocate."
      />
    </PageShell>
  );
}
