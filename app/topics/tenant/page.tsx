import PageShell from "@/components/layout/PageShell";
import TopicDetail from "@/components/layout/TopicDetail";

export default function TenantTopicPage() {
  return (
    <PageShell>
      <TopicDetail
        title="Tenant & Landlord Rights"
        intro="Basic information on tenancy agreements, deposits, rent, and eviction process under Kenyan law."
        lawPoints={[
          "A tenancy agreement can be written or verbal, but written agreements are easier to enforce.",
          "A tenant has the right to peaceful enjoyment of the property and habitable living conditions.",
          "A landlord must follow due process before recovering possession — a notice to quit is normally required.",
          "Deposit deductions must be agreed and documented; unjustified withholding may be disputed.",
        ]}
        steps={[
          "Review your tenancy agreement and keep copies of all payments.",
          "Raise issues with your landlord in writing first.",
          "If unresolved, send a formal demand letter.",
          "Escalate to the Rent Restriction Tribunal or seek help from a licensed advocate.",
        ]}
        documents={[
          "Rent acknowledgement letter",
          "Demand letter for deposit refund",
          "Complaint letter",
        ]}
        help="Rent Restriction Tribunal, the Ministry of Lands and Housing, or a licensed advocate of the High Court of Kenya."
      />
    </PageShell>
  );
}
