# HAKI AI — Preliminary Pages (DSE 315 Milestone M5)

> Paste each section below into the department template (Times New Roman 12, 1.5 spacing, page numbers lower-case roman for prelims). Replace every `[square-bracket]` placeholder before printing. Page/figure numbers in the TOC are to be finalised after binding.

---

## Cover

**HAKI AI: LEGAL INFORMATION AND DOCUMENT ASSISTANCE PLATFORM FOR KENYA**

A Computer Systems Project Report Submitted in Partial Fulfilment of the Requirements for the Degree of Diploma in Information Technology (DSE 315 — Computer Systems Project)

**Zetech University**

| | |
|---|---|
| Student Name | `[Full Name]` |
| Admission Number | `[Adm. No.]` |
| Programme | `[BSc. IT / Dip. IT — insert]` |
| Supervisor | `[Supervisor Name]` |
| Date | October 2026 |

---

## Declaration

I, `[Full Name]` of admission number `[Adm. No.]`, declare that this DSE 315 Computer Systems Project, "HAKI AI: Legal Information and Document Assistance Platform for Kenya", is my own work and has not been submitted for the award of any other diploma, degree, or certificate in this or any other institution. Where references have been used, they have been fully acknowledged.

Signature: ______________________ Date: ______________________

---

## Dedication

*(To be completed by the student — e.g. to my parents / family, and to every Kenyan who has faced a legal problem without knowing where to start.)*

---

## Acknowledgement

I sincerely thank my supervisor, `[Supervisor Name]`, for the guidance and regular feedback throughout this project. I also thank the lecturers of the DSE 315 course for the course material, my classmates for testing the prototype, and the National Council for Law Reporting (Kenya Law) for making Kenyan legislation publicly accessible — the platform links to, and does not replace, those authoritative sources.

---

## Abstract

Access to basic legal information in Kenya is limited by cost, language, and awareness. HAKI AI is a cloud-hosted, AI-assisted legal-information and document-assistance platform that addresses this gap for six everyday areas: tenant rights, employment, consumer protection, debt recovery, business agreements, and complaint letters. The system has five objectives: (1) an Ask assistant that answers general legal-information questions and refuses out-of-scope or high-risk queries; (2) nine fixed-template document generators producing PDF/DOCX instruments; (3) a curated repository of seven Kenyan Acts with Kenya Law links (7 sources, 22 provisions) used to ground every citation; (4) a Legal Aid Directory and bilingual English/Kiswahili access; and (5) Supabase persistence for drafts, history, feedback, and moderation with row-level security. The system is a Next.js 16 + React 19 progressive web application deployed at https://haki-ai.vercel.app; the production build completes cleanly with 53 routes, and the automated grounding and retrieval test suites (`npm run test:grounding`, `npm run test:rag`) pass in full. HAKI AI provides general legal information only and is not a substitute for a licensed Advocate of the High Court of Kenya.

**Keywords:** access to justice, legal information system, document generation, retrieval grounding, Kenya Law, Kiswahili, PWA

---

## Table of Contents

| Section | Title | File |
|---------|-------|------|
| — | Preliminary pages (cover → abbreviations) | `docs/00-preliminary/preliminary-pages.md` |
| Chapter 1 | Planning and Analysis | `docs/01-chapter-one/chapter-one.md` |
| 1.6 | Gantt Chart | `docs/01-chapter-one/gantt.csv` |
| 1.7 | Budget | `docs/01-chapter-one/budget.md` |
| 1.8 | Prototype Review | `docs/01-chapter-one/prototype-review.md` |
| Chapter 2 | Design and Modelling | `docs/02-chapter-two/chapter-two.md` |
| Chapter 3 | Implementation and Testing | `docs/03-chapter-three/test-report.md` |
| 3.5 | Database Integration Proof | `docs/03-chapter-three/m4-integration-proof.md` |
| Chapter 4 | Summary, Conclusions, Recommendations | `docs/04-chapter-four/chapter-four-refs-prelim.md` |
| References | APA 7 list | `docs/04-chapter-four/references.md` |
| Appendix A | Test and UI screenshots | `docs/screenshots/` + `docs/04-chapter-four/appendix-checklist.md` |
| Appendix B | Supervision Form scans (M1–M6) | *(to be scanned)* |
| Appendix C | Dataset printout (7 sources, 22 provisions) | `docs/dataset/legal_sources.csv`, `docs/dataset/legal_provisions.csv` |

*(Final page numbers to be inserted after pagination: insert TOC in Word → References → Table of Contents.)*

---

## List of Figures

| Fig. | Title | Source section |
|------|-------|----------------|
| 2.1 | Use-case diagram (Visitor, Member, Admin) | Chapter 2 §2.1 |
| 2.2 | Sequence diagram — Ask flow | Chapter 2 §2.2 |
| 2.3 | Sequence diagram — Generate flow (steps 1–7) | Chapter 2 §2.3 |
| 2.4 | Entity relationship diagram | Chapter 2 §2.4 |
| 2.5 | Flowchart — Ask flow | Chapter 2 §2.6 |
| 2.6 | Flowchart — Generate flow | Chapter 2 §2.7 |
| 2.7–2.11 | UI wireframes: Home, Ask, Generator form, PDF output, Dashboard | Chapter 2 §2.5 |
| 1.1 | Gantt chart (Wk1–Wk12) | Chapter 1 §1.6 (`gantt.csv`) |
| A.1 | Architecture diagram | `docs/screenshots/00-architecture.png` |
| A.2–A.12 | Application screenshots (Home, Ask EN/SW, Generator, Salary claim, OCR, Clauses, Sources, Legal Aid, Dashboard, sample contract) | Appendix A |

*(Mermaid blocks in `chapter-two.md` render on GitHub; for Word, export each as PNG/SVG from draw.io or the GitHub Mermaid preview and paste above.)*

---

## List of Tables

| Table | Title | Source section |
|-------|-------|----------------|
| 1.1 | Functional requirements FR-1 – FR-11 | Chapter 1 §1.5 |
| 1.2 | Project budget | Chapter 1 §1.7 (`budget.md`) |
| 3.1 | Static checks (typecheck, lint, build) | Chapter 3 §3.1 |
| 3.2 | Automated test suites (grounding, RAG) | Chapter 3 §3.2 |
| 3.3 | Manual functional test cases | Chapter 3 §3.3 |
| A.1 | Dataset summary — 7 legal sources | Appendix C |
| A.2 | Dataset summary — 22 legal provisions | Appendix C |

---

## Abbreviations

| Abbr. | Meaning |
|-------|---------|
| API | Application Programming Interface |
| DOCX | Microsoft Word Open XML document |
| EN/SW | English / Kiswahili (Swahili) |
| ERD | Entity Relationship Diagram |
| FK | Foreign Key |
| HTML | HyperText Markup Language |
| JSON-LD | JavaScript Object Notation for Linked Data |
| Kenya Law | National Council for Law Reporting (Kenya) — kenyalaw.org |
| KES | Kenyan Shilling |
| MVP | Minimum Viable Product |
| OG | Open Graph (social preview metadata) |
| PDF | Portable Document Format |
| PK | Primary Key |
| PWA | Progressive Web Application |
| RAG | Retrieval-Augmented Generation |
| RLS | Row-Level Security (PostgreSQL/Supabase) |
| SPA | Single-Page Application |
| SQL | Structured Query Language |
| TC | Test Case |
| TF-IDF | Term Frequency–Inverse Document Frequency |
| UML | Unified Modeling Language |
| URL | Uniform Resource Locator |
