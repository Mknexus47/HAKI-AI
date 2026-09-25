import PageShell from "@/components/layout/PageShell";
import TopicDetail from "@/components/layout/TopicDetail";

export default function EmploymentTopicPage() {
  return (
    <PageShell>
      <TopicDetail
        title="Employment Basics"
        intro="Plain-language information on contracts, pay, working conditions, and unfair dismissal under the Employment Act, 2007."
        lawPoints={[
          "An employee is entitled to a written contract describing terms of employment.",
          "Wages must be paid as agreed, and payslips should be issued.",
          "Unfair dismissal requires a fair reason and a fair procedure.",
          "Employees are entitled to leave, notice, and terminal benefits as provided by law.",
        ]}
        steps={[
          "Keep copies of your contract, payslips, and related messages.",
          "Raise grievances internally in writing first.",
          "Send a formal complaint letter if internal processes fail.",
          "Report to the Ministry of Labour or consult a licensed advocate.",
        ]}
        documents={[
          "Complaint letter",
          "Demand letter for unpaid dues",
          "Service agreement draft",
        ]}
        help="The Ministry of Labour and Social Protection, the Employment and Labour Relations Court, or a licensed advocate."
      />
    </PageShell>
  );
}
