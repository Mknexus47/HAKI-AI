# REFERENCES

> Full APA 7th-edition reference list for the HAKI AI report (DSE 315).
> Paste this section after Chapter 4 (Summary, Conclusions & Recommendations)
> and before the Appendices in the bound document. Every entry below is cited
> somewhere in the system or its documentation — do not add references that
> are not used in-text.

## Legislation (Kenya)

Constitution of Kenya, 2010 (Kenya). https://kenyalaw.org/akn/ke/act/2010/constitution

Consumer Protection Act, 2012, Cap. 501 (Kenya). https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31

Employment Act, 2007, No. 11 of 2007 (Kenya). https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31

Landlord and Tenant (Shops, Hotels and Catering Establishments) Act, Cap. 301 (Kenya). https://kenyalaw.org/akn/ke/act/1965/13/eng@2022-12-31

Law of Contract Act, Cap. 23 (Kenya). https://kenyalaw.org/akn/ke/act/1960/43/eng@2022-12-31

Oaths and Statutory Declarations Act, Cap. 15 (Kenya). https://kenyalaw.org/akn/ke/act/1926/29/eng@2024-04-26

Rent Restriction Act, Cap. 296 (Kenya). https://kenyalaw.org/akn/ke/act/1959/35

## Books and journal articles

Farley, D. (2021). *Modern software engineering: Doing what works to build better software faster*. Addison-Wesley.

Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.-t., Rocktäschel, T., Riedel, S., & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *Advances in Neural Information Processing Systems, 33*, 9459–9474. https://arxiv.org/abs/2005.11401

Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9th ed.). McGraw-Hill Education.

Smith, R. (2007). An overview of the Tesseract OCR engine. In *Proceedings of the Ninth International Conference on Document Analysis and Recognition* (pp. 629–633). IEEE. https://doi.org/10.1109/ICDAR.2007.4376991

Tilley, S., & Rosenblatt, H. J. (2017). *Systems analysis and design* (11th ed.). Cengage Learning.

## Reports

National Council on the Administration of Justice. (2024). *Administration of justice in Kenya annual report 2023–2024*. https://ncaj.go.ke/wp-content/uploads/download-manager-files/Administration-of-Justice-in-Kenya-Annual-Report-2023-2024.pdf

World Justice Project. (2019). *Global insights on access to justice 2019*. https://worldjusticeproject.org/our-work/research-and-data/global-insights-access-justice-2019

## Software and technical documentation

Google. (2026). *Gemini API documentation*. https://ai.google.dev/gemini-api/docs

Supabase. (2026). *Supabase documentation*. https://supabase.com/docs

Tesseract.js (Version 7.0.0) [Computer software]. (2026). https://github.com/naptha/tesseract.js

Vercel. (2026). *Next.js documentation* (Version 16). https://nextjs.org/docs

---

## Where each reference is cited in-text

| Reference | Chapter / section | What it supports |
|---|---|---|
| Constitution of Kenya (2010) | Ch.3 legal grounding; Ch.4 objectives | Live source in `lib/legal-sources.ts` (`const-a2`, `const-a41`) |
| Consumer Protection Act (2012) | Ch.3 legal grounding | Refund/complaint generators (`cpa-*` provisions) |
| Employment Act (2007) | Ch.3 legal grounding | Employment contract, salary claim (ss.19–20, 27, 28, 35, 41, 49, 51) |
| Landlord & Tenant Act (Cap. 301) | Ch.3 legal grounding | Tenancy agreement, demand letter (`lt301-*`) |
| Law of Contract Act (Cap. 23) | Ch.3 legal grounding | Contract-based generators (`loc-*`) |
| Oaths & Statutory Declarations Act (Cap. 15) | Ch.3 legal grounding | Affidavit generator (`oaths-*`) |
| Rent Restriction Act (Cap. 296) | Ch.3 legal grounding | Tenancy agreement, rent acknowledgement (`rr-scope`) |
| Farley (2021) | Ch.3 methodology | Engineering discipline: typecheck/build/tests as gates |
| Lewis et al. (2020) | Ch.2/Ch.3 methodology | RAG approach behind `/api/ask` (retrieval → grounded generation) |
| Pressman & Maxim (2020) | Ch.1/Ch.2 | SDLC structure, requirements, design chapters |
| Smith (2007) | Ch.3 | Tesseract OCR engine used by `/contract-analysis` |
| Tilley & Rosenblatt (2017) | Ch.2 | Use-case, sequence, ERD and UI design notation |
| NCAJ (2024) | Ch.1 background | Kenyan access-to-justice problem statement |
| World Justice Project (2019) | Ch.1 background | Global legal-needs statistics cited in the problem statement |
| Google Gemini docs | Ch.3 | LLM provider integration (`lib/rag.ts`) |
| Supabase docs | Ch.3/M4 | Auth, RLS policies, persistence |
| Tesseract.js | Ch.3 | In-browser OCR implementation |
| Next.js docs | Ch.3 | App Router, route handlers, build |

## Notes for the defense

- Citation style is APA 7th edition; legislation is listed under a separate
  **Legislation** heading (standard practice for non-US statutes).
- The app deliberately cites **Kenya Law** URLs (not the Parliament PDF) because
  those are the exact links stored in `lib/legal-sources.ts` and shown as
  source chips in `/ask` and `/legal-sources`. The Parliament PDF may be cited
  as a supplementary source if your supervisor prefers it.
- Books cited by the department (`Pressman`, `Farley`, `Tilley & Rosenblatt`)
  map to the SDLC, engineering-discipline, and analysis/design chapters — keep
  at least one in-text citation per book in Ch.1–Ch.3 so the list is justified.
- Do **not** list tools you never used (e.g., Kaggle, TensorFlow, MongoDB) —
  the panel checks the references against the live demo.
