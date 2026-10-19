// Acceptance tests for the Ask RAG retrieval layer (no API key required —
// these test the vector index and query expansion only; the Gemini call
// itself degrades to template answers when unkeyed/unavailable).
// Run: npm run test:rag

import {
  expandQuery,
  searchProvisions,
  VECTOR_INDEX_SIZE,
} from "@/lib/vector-store"

let failures = 0

function check(name: string, condition: boolean, detail = ""): void {
  if (condition) {
    console.log(`PASS  ${name}`)
  } else {
    failures += 1
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

// 1. Index covers the verified repository.
{
  check(
    "vector index built over repository",
    VECTOR_INDEX_SIZE >= 15,
    `size=${VECTOR_INDEX_SIZE}`
  )
}

// 2. English queries retrieve topically correct provisions.
{
  const deposit = searchProvisions(
    "My landlord kept my deposit when I moved out of the flat",
    4
  )
  check(
    "deposit query returns tenancy sources",
    deposit.length > 0 &&
      deposit.some(
        (hit) =>
          hit.source.id === "rent-restriction-act" ||
          hit.source.id === "landlord-tenant-shops-act"
      ),
    JSON.stringify(deposit.map((h) => h.source.id))
  )
  check(
    "deposit query has non-trivial scores",
    deposit.every((hit) => hit.score > 0.02)
  )

  // Regression: boilerplate ("rights?", "moved out") must not drown the
  // deposit signal — rr-scope must rank first for this question.
  const depositRights = searchProvisions(
    "My landlord kept my deposit when I moved out. What are my rights?",
    4
  )
  check(
    "deposit+rights query ranks tenancy provision first",
    depositRights.length > 0 &&
      depositRights[0].source.id === "rent-restriction-act",
    JSON.stringify(depositRights.map((h) => h.provision.id))
  )

  const dismissal = searchProvisions(
    "my employer dismissed me without notice pay",
    4
  )
  check(
    "dismissal query returns Employment Act sources",
    dismissal.length > 0 &&
      dismissal.some((hit) => hit.source.id === "employment-act-2007"),
    JSON.stringify(dismissal.map((h) => h.source.id))
  )

  const salary = searchProvisions(
    "unpaid salary and final pay after termination",
    4
  )
  check(
    "salary query retrieves service-pay / remedies provisions",
    salary.some((hit) =>
      ["emp-s35-service-pay", "emp-s49-remedies"].includes(hit.provision.id)
    ),
    JSON.stringify(salary.map((h) => h.provision.id))
  )

  const consumer = searchProvisions(
    "faulty goods the seller refuses to refund my money",
    4
  )
  check(
    "consumer query returns Consumer Protection Act sources",
    consumer.length > 0 &&
      consumer.some((hit) => hit.source.id === "consumer-protection-act-2012"),
    JSON.stringify(consumer.map((h) => h.source.id))
  )
}

// 3. Swahili queries expand to English repository terms.
{
  const expanded = expandQuery("mishahara yangu imechelewa kulipwa")
  check(
    "Swahili 'mishahara' expands to salary/wages",
    expanded.includes("salary") || expanded.includes("wages"),
    JSON.stringify(expanded)
  )

  const swDeposit = searchProvisions(
    "mmiliki wangu amechukua amana yangu bila ruhusa",
    4
  )
  check(
    "Swahili deposit query returns tenancy sources",
    swDeposit.length > 0 &&
      swDeposit.some(
        (hit) =>
          hit.source.id === "rent-restriction-act" ||
          hit.source.id === "landlord-tenant-shops-act"
      ),
    JSON.stringify(swDeposit.map((h) => h.source.id))
  )

  const swSalary = searchProvisions("mfanyakazi hajalipwa mishahara", 4)
  check(
    "Swahili salary query returns Employment Act sources",
    swSalary.length > 0 &&
      swSalary.some((hit) => hit.source.id === "employment-act-2007"),
    JSON.stringify(swSalary.map((h) => h.source.id))
  )
}

// 4. Garbage queries return nothing useful (no invented relevance).
{
  const nonsense = searchProvisions("zzzz qqqq xxx wxyz", 4)
  check(
    "nonsense query returns no meaningful hits",
    nonsense.length === 0,
    JSON.stringify(nonsense.map((h) => h.score))
  )
}

// 5. Retrieval is deterministic.
{
  const first = searchProvisions("termination and severance pay", 4)
  const second = searchProvisions("termination and severance pay", 4)
  check(
    "vector retrieval deterministic",
    JSON.stringify(first.map((h) => h.provision.id)) ===
      JSON.stringify(second.map((h) => h.provision.id))
  )
}

console.log(
  failures === 0
    ? "\nAll RAG retrieval tests passed."
    : `\n${failures} test(s) failed.`
)
process.exit(failures === 0 ? 0 : 1)
