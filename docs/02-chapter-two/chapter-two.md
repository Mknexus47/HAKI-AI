# HAKI AI — Chapter Two: Design & Modelling (DSE 315 Milestone M2)

> Reverse-engineered FROM the shipped UI (`app/`), pipeline (`lib/legal-retrieval.ts`, `lib/legal-generation.ts`), and schema (`supabase/schema.sql`). Draw.io / dbdiagram.io versions can be traced 1:1 from the Mermaid below.

## 2.1 Use-Case Diagram (Actors: Visitor, Member, Admin)

```mermaid
flowchart LR
  Visitor((Visitor))
  Member((Member))
  Admin((Admin))

  Visitor --> UC1[Ask legal-information question]
  Visitor --> UC2[Browse Legal Sources + Kenya Law links]
  Visitor --> UC3[Use Legal Aid Directory]
  Visitor --> UC4[Generate document as guest]
  Member --> UC1
  Member --> UC2
  Member --> UC3
  Member --> UC4
  Member --> UC5[Save / resume drafts]
  Member --> UC6[View / delete history]
  Member --> UC7[Submit feedback]
  Admin --> UC8[Review flagged sessions]
  Admin --> UC9[Review feedback + generations]
  Admin --> UC10[Maintain legal_sources versions]
```

Evidence: `app/ask`, `app/legal-sources`, `app/legal-aid`, `app/generate-*/`, `app/dashboard` (drafts/history/feedback), `app/admin` (flagged_sessions), RLS admin = `michaelkariuki281@gmail.com` (`supabase/schema.sql`).

## 2.2 Sequence — Ask flow (scoped)

```mermaid
sequenceDiagram
  actor U as User
  participant UI as app/ask/page.tsx
  participant C as lib/chat.ts
  participant M as lib/moderation.ts
  participant A as app/legal-aid/
  U->>UI: question (EN/SW)
  UI->>M: screen high-risk / abuse
  alt high-risk
    M-->>UI: refusal + advocate referral
  else
    UI->>C: match TOPICS (6 areas)
    alt in-scope
      C-->>UI: general information + disclaimer
    else out-of-scope
      C-->>UI: SCOPE_ANSWER + Legal Aid redirect
      UI->>A: offer referral
    end
  end
```

Evidence: `lib/chat.ts: TOPICS`, `SCOPE_ANSWER` (six areas: Tenant, Employment, Consumer, Debt, Business Agreements, Complaint Letters); `lib/i18n.ts` scope disclaimer; `lib/moderation.ts`.

## 2.3 Sequence — Generate flow (steps 1–7)

```mermaid
sequenceDiagram
  actor U as User
  participant F as app/generate-*/page.tsx
  participant API as app/api/generate-document/route.ts
  participant R as lib/legal-retrieval.ts (steps 1-5)
  participant G as lib/legal-generation.ts (steps 6-7)
  participant P as lib/pdf.ts / lib/docx.ts
  participant DB as Supabase
  U->>F: fill form + consent
  F->>API: POST docType + form
  API->>R: 1 identify type/issues, 2 applicable laws, 3 keyword+semantic search, 4 retrieve context, 5 authority/date gate
  R-->>API: RetrievalResult (evidence[] + semanticOnly[] + sufficient?)
  API->>G: 6 generate from fixed template (lib/documents.ts) + evidence only
  G->>G: 7 validateCitations (CITATION_PATTERNS + QUOTATION_PATTERN)
  alt validation ok
    G-->>API: passed + paragraphs
  else fabricated authority
    G-->>API: flagged-needs-review + findings
  end
  API->>DB: insert document_generations + document_versions (metadata only)
  API-->>F: paragraphs + sources
  F->>P: downloadPdf / downloadDocx (+ brand logo, fail-safe)
```

Evidence: `lib/legal-retrieval.ts:1-15` (steps 1–5 comments), `lib/legal-generation.ts:1-16` (steps 6–7), `lib/documents.ts: buildParagraphsForDoc`, `scripts/test-grounding.ts` (retrieval sufficient, citation validation, fabricated Section 99 / invented case law rejected).

## 2.4 ERD (from `supabase/schema.sql` FKs)

```mermaid
erDiagram
  auth_users ||--o{ document_requests : "1 - N drafts"
  auth_users ||--o{ documents : "1 - N history"
  auth_users ||--o{ feedback : "1 - N"
  auth_users ||--o{ flagged_sessions : "1 - N"
  auth_users ||--o{ document_generations : "1 - N"
  document_generations ||--o{ document_versions : "1 - N versions"
  legal_sources ||--o{ legal_provisions : "1 - N provisions"
  legal_sources ||--o{ legal_source_versions : "1 - N versions"

  auth_users {
    uuid id PK
    string email
  }
  document_requests {
    uuid id PK
    uuid user_id FK
    string doc_type
    jsonb form_data
    bool consent
  }
  documents {
    uuid id PK
    uuid user_id FK
    string doc_type
    string title
    string status
  }
  feedback {
    uuid id PK
    uuid user_id FK
    string context
    bool helpful
  }
  flagged_sessions {
    uuid id PK
    uuid user_id FK
    string reason
    string status
  }
  legal_sources {
    string id PK
    string title
    string source_url
    string verification_status
    int version
  }
  legal_provisions {
    string id PK
    string source_id FK
    string article_or_section
    string[] keywords
    string[] doc_types
  }
  document_generations {
    uuid id PK
    uuid user_id FK
    string doc_type
    string[] provision_ids
    string validation_status
  }
  document_versions {
    uuid id PK
    uuid generation_id FK
    int version_no
    string generated_text
  }
```

RLS: drafts/documents/generations owner-only; `legal_sources`/`legal_provisions` public read + admin write; `flagged_sessions`/`feedback` admin select (`supabase/schema.sql:60-99`, `167-204`).

## 2.5 UI Wireframes (traced from live pages — screenshot then box-trace in draw.io)

1. **Home (`/`)**: header (logo `public/logo-icon.jpg` + EN/SW toggle + login) → hero (HAKI AI + disclaimer banner) → 6-area cards → 9-generator grid → Legal Aid CTA → footer (Gold #C9A227 Contact button).
2. **Ask (`/ask`)**: input box → scope-notice banner (`lib/i18n.ts`) → answer card (facts vs drafting vs authorities) → out-of-scope card with Legal Aid link → feedback thumbs.
3. **Generator form (`/generate-*`)**: title → form fields (sender/phone/recipient/issue/amount/…) → consent checkbox → Generate → preview (title + body + authorities + missing-info + advocate notes) → Download PDF / DOCX.
4. **PDF output**: centred logo (54pt, `lib/brand-logo.ts`) → TITLE → justified body (`lib/pdf.ts` TJ arrays) → authorities (Kenya Law URLs) → footer every page (template + disclaimer + page no.).
5. **Dashboard (`/dashboard`)**: drafts (save/resume per `user_id+doc_type` unique) → history (metadata only) → delete → feedback summary.

Flowcharts for draw.io: Ask flow = `lib/chat.ts` branch (in-scope / out-of-scope / high-risk); Generate flow = §2.3 steps 1–7.
