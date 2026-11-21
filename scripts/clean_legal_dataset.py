from __future__ import annotations

import argparse
import ast
import csv
import io
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]

SOURCE_COLUMNS = [
    "source_id", "title", "citation", "jurisdiction", "publisher",
    "publication_details", "effective_date", "source_url", "license_note",
    "verification_status", "version", "last_checked_at", "retrieved_at",
]
PROVISION_COLUMNS = [
    "provision_id", "source_id", "article_or_section", "heading", "summary",
    "context_note", "keywords", "doc_types", "verification_status",
    "source_url", "retrieved_at",
]
SOURCE_REQUIRED = [
    "source_id", "title", "citation", "jurisdiction", "publisher",
    "publication_details", "effective_date", "source_url",
    "verification_status", "version", "last_checked_at", "retrieved_at",
]
PROVISION_REQUIRED = [
    "provision_id", "source_id", "article_or_section", "heading", "summary",
    "keywords", "doc_types", "verification_status", "source_url", "retrieved_at",
]
SOURCE_DATES = ("effective_date", "last_checked_at", "retrieved_at")
PROVISION_DATES = ("retrieved_at",)
STATUSES = {
    "verified", "sourced-pending-fulltext-check", "stale-needs-recheck",
    "superseded", "withdrawn",
}
STATUS_ALIASES = {
    "pending": "sourced-pending-fulltext-check",
    "pending-check": "sourced-pending-fulltext-check",
    "pending-fulltext-check": "sourced-pending-fulltext-check",
    "sourced-pending-full-text-check": "sourced-pending-fulltext-check",
    "stale": "stale-needs-recheck",
    "needs-recheck": "stale-needs-recheck",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Clean, validate and reconcile the HAKI AI legal dataset."
    )
    parser.add_argument("--sources", default=str(ROOT / "data/dataset/legal_sources.csv"))
    parser.add_argument("--provisions", default=str(ROOT / "data/dataset/legal_provisions.csv"))
    parser.add_argument("--out-dir", default=str(ROOT / "data/dataset/cleaned"))
    parser.add_argument("--report", default=str(ROOT / "data/dataset/cleaning_report.md"))
    parser.add_argument("--ts-source", default=str(ROOT / "lib/legal-sources.ts"))
    parser.add_argument("--no-sync", action="store_true")
    parser.add_argument("--keep-extract-values", action="store_true")
    parser.add_argument("--check-urls", action="store_true")
    return parser


def step(number: str, title: str) -> None:
    print()
    print(f"[{number}] {title}")
    print("-" * 68)


def line(label: str, value: object) -> None:
    print(f"  {label:<30} {value}")


def echo(value: object, limit: int = 120) -> str:
    text = str(value).replace("\r", " ").replace("\n", " ").strip()
    if len(text) > limit:
        text = text[:limit - 3] + "..."
    return text.encode("ascii", "replace").decode("ascii")


def decode_text(path: Path) -> tuple[str, str]:
    raw = path.read_bytes()
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return raw.decode(encoding), encoding
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Unable to decode {path}")


def read_rows(path: Path, columns: list[str]) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Missing input file: {path}")
    text, encoding = decode_text(path)
    reader = csv.DictReader(io.StringIO(text))
    headers = reader.fieldnames or []
    return {
        "path": path,
        "encoding": encoding,
        "headers": headers,
        "rows": [dict(row) for row in reader],
        "missing": [column for column in columns if column not in headers],
        "extra": [column for column in headers if column not in columns],
    }


def repair_mojibake(value: str) -> str:
    if not value:
        return value
    try:
        return value.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return value


def text_value(value: object) -> str:
    text = "" if value is None else str(value)
    text = repair_mojibake(text).replace("\u00a0", " ")
    return re.sub(r"\s+", " ", text).strip()


def id_value(value: object) -> str:
    text = re.sub(r"[\s_]+", "-", text_value(value).lower())
    text = re.sub(r"[^a-z0-9-]", "-", text)
    return re.sub(r"-{2,}", "-", text).strip("-")


def date_value(value: object) -> str:
    text = text_value(value)
    if not text:
        return text
    for date_format in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%d %B %Y",
                        "%d %b %Y", "%B %d, %Y", "%b %d, %Y"):
        try:
            return datetime.strptime(text, date_format).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return text


def url_value(value: object) -> str:
    text = text_value(value)
    if not text:
        return text
    if "://" not in text:
        text = "https://" + text.lstrip("/")
    parts = urlsplit(text)
    path = re.sub(r"/{2,}", "/", parts.path)
    if path != "/":
        path = path.rstrip("/")
    return urlunsplit((
        (parts.scheme or "https").lower(),
        parts.netloc.lower(),
        path,
        parts.query,
        parts.fragment,
    ))


def status_value(value: object) -> str:
    text = re.sub(r"\s+", "-", text_value(value).lower().replace("_", "-"))
    return STATUS_ALIASES.get(text, text)


def list_value(value: object) -> str:
    text = text_value(value)
    if not text:
        return text
    items, seen = [], set()
    for item in re.split(r"\s*[;,|]\s*", text):
        item = item.strip().lower()
        if item and item not in seen:
            seen.add(item)
            items.append(item)
    return "; ".join(items)


def normalize_source(raw: dict) -> dict:
    cleaned = {column: text_value(raw.get(column, "")) for column in SOURCE_COLUMNS}
    cleaned["source_id"] = id_value(raw.get("source_id", ""))
    cleaned["effective_date"] = date_value(raw.get("effective_date", ""))
    cleaned["last_checked_at"] = date_value(raw.get("last_checked_at", ""))
    cleaned["retrieved_at"] = date_value(raw.get("retrieved_at", ""))
    cleaned["source_url"] = url_value(raw.get("source_url", ""))
    cleaned["verification_status"] = status_value(raw.get("verification_status", ""))
    version = text_value(raw.get("version", ""))
    if re.fullmatch(r"\d+(?:\.0+)?", version):
        version = str(int(float(version)))
    cleaned["version"] = version
    return cleaned


def normalize_provision(raw: dict) -> dict:
    cleaned = {column: text_value(raw.get(column, "")) for column in PROVISION_COLUMNS}
    cleaned["provision_id"] = id_value(raw.get("provision_id", ""))
    cleaned["source_id"] = id_value(raw.get("source_id", ""))
    cleaned["keywords"] = list_value(raw.get("keywords", ""))
    cleaned["doc_types"] = list_value(raw.get("doc_types", ""))
    cleaned["verification_status"] = status_value(raw.get("verification_status", ""))
    cleaned["source_url"] = url_value(raw.get("source_url", ""))
    cleaned["retrieved_at"] = date_value(raw.get("retrieved_at", ""))
    return cleaned


def is_iso_date(value: str) -> bool:
    try:
        datetime.strptime(value, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def url_problem(value: str) -> str:
    if not value:
        return "empty"
    if re.search(r"\s", value):
        return "contains whitespace"
    parts = urlsplit(value)
    if parts.scheme != "https":
        return "scheme is not https"
    if not parts.netloc:
        return "missing host"
    host = (parts.hostname or "").lower()
    if host != "kenyalaw.org" and not host.endswith(".kenyalaw.org"):
        return f"unexpected host {host or '<none>'}"
    return ""


def add_issue(issues: list[dict], severity: str, dataset: str, row_id: str,
              field: str, problem: str, action: str, old: object = "",
              new: object = "") -> None:
    issues.append({
        "severity": severity,
        "dataset": dataset,
        "row_id": row_id,
        "field": field,
        "issue": problem,
        "action": action,
        "old_value": "" if old is None else str(old),
        "new_value": "" if new is None else str(new),
    })


def changed_fields(raw: dict, cleaned: dict, columns: list[str]) -> list[tuple[str, str, str]]:
    changes = []
    for column in columns:
        old = "" if raw.get(column) is None else str(raw.get(column))
        new = cleaned.get(column, "")
        if old != new:
            changes.append((column, old, new))
    return changes


def validate_rows(rows: list[dict], columns: list[str], required: list[str],
                  date_fields: tuple[str, ...], dataset: str, id_field: str,
                  issues: list[dict]) -> tuple[list[dict], list[dict], dict]:
    valid, bad = [], []
    summary = {"rows": len(rows), "required": 0, "dates": 0, "urls": 0, "status": 0}
    for row in rows:
        row_id = row.get(id_field) or f"<missing-{id_field}>"
        missing = [field for field in required if not row.get(field)]
        bad_dates = [f for f in date_fields if row.get(f) and not is_iso_date(row[f])]
        bad_urls = []
        for field in ("source_url",):
            problem = url_problem(row.get(field, ""))
            if problem:
                bad_urls.append((field, problem))
        bad_status = row.get("verification_status") not in STATUSES
        fatal = bool(missing) or bad_status or (dataset == "sources" and "effective_date" in bad_dates)

        if missing:
            summary["required"] += 1
            for field in missing:
                add_issue(issues, "ERROR", dataset, row_id, field,
                          "Missing required value", "Quarantined row")
        for field in bad_dates:
            severity = "ERROR" if field == "effective_date" and dataset == "sources" else "WARNING"
            summary["dates"] += 1
            add_issue(issues, severity, dataset, row_id, field,
                      "Date is not ISO YYYY-MM-DD",
                      "Quarantined row" if severity == "ERROR" else "Kept with warning",
                      row.get(field), "")
        for field, problem in bad_urls:
            summary["urls"] += 1
            add_issue(issues, "WARNING", dataset, row_id, field,
                      f"Invalid URL: {problem}", "Kept with warning", row.get(field), "")
        if bad_status:
            summary["status"] += 1
            add_issue(issues, "ERROR", dataset, row_id, "verification_status",
                      "Not an allowed verification status", "Quarantined row",
                      row.get("verification_status"), "")

        if fatal:
            bad.append({"dataset": dataset, "row_id": row_id,
                        "reason": "Failed required-field, date, or status checks",
                        "row": row})
        else:
            valid.append(row)
    return valid, bad, summary


def dedupe_rows(rows: list[dict], id_field: str, dataset: str,
                issues: list[dict]) -> tuple[list[dict], list[dict], int]:
    unique, dropped, seen = [], [], set()
    for row in rows:
        row_id = row.get(id_field, "")
        if row_id in seen:
            add_issue(issues, "WARNING", dataset, row_id, id_field,
                      "Duplicate primary key", "Dropped duplicate row", row_id, "")
            dropped.append({"dataset": dataset, "row_id": row_id,
                            "reason": "Duplicate primary key", "row": row})
            continue
        seen.add(row_id)
        unique.append(row)
    return unique, dropped, len(dropped)


def balanced_slice(text: str, open_index: int, open_char: str,
                   close_char: str) -> tuple[str, int]:
    depth = 0
    index = open_index
    quote = ""
    escaped = False
    while index < len(text):
        char = text[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = ""
        elif char == "/" and index + 1 < len(text) and text[index + 1] == "/":
            newline = text.find("\n", index)
            index = len(text) if newline < 0 else newline
        elif char == "/" and index + 1 < len(text) and text[index + 1] == "*":
            end = text.find("*/", index + 2)
            index = len(text) if end < 0 else end + 1
        elif char in ('"', "'", "`"):
            quote = char
        elif char == open_char:
            depth += 1
        elif char == close_char:
            depth -= 1
            if depth == 0:
                return text[open_index + 1:index], index
        index += 1
    raise ValueError(f"Unbalanced {open_char}{close_char} at {open_index}")


def array_body(ts_text: str, export_name: str) -> str:
    marker = f"export const {export_name}"
    start = ts_text.find(marker)
    if start < 0:
        raise ValueError(f"Could not find {export_name}")
    equals = ts_text.find("=", start)
    array_start = ts_text.find("[", equals)
    if equals < 0 or array_start < 0:
        raise ValueError(f"Could not find array for {export_name}")
    body, _ = balanced_slice(ts_text, array_start, "[", "]")
    return body


def object_bodies(array_text: str) -> list[str]:
    bodies, index = [], 0
    while index < len(array_text):
        if array_text[index] == "{":
            body, end = balanced_slice(array_text, index, "{", "}")
            bodies.append(body)
            index = end + 1
        else:
            index += 1
    return bodies


def ts_string(body: str, key: str) -> str:
    pattern = r'(?ms)^\s*' + re.escape(key) + r'\s*:\s*("(?:[^"\\]|\\.)*")'
    match = re.search(pattern, body)
    if not match:
        return ""
    token = match.group(1)
    try:
        return ast.literal_eval(token)
    except (ValueError, SyntaxError):
        return token[1:-1]


def ts_int(body: str, key: str) -> str:
    pattern = r"(?m)^\s*" + re.escape(key) + r"\s*:\s*(\d+)"
    match = re.search(pattern, body)
    return match.group(1) if match else ""


def ts_list(body: str, key: str) -> list[str]:
    match = re.search(r"(?m)^\s*" + re.escape(key) + r"\s*:\s*\[", body)
    if not match:
        return []
    bracket_index = body.find("[", match.start())
    inner, _ = balanced_slice(body, bracket_index, "[", "]")
    tokens = re.findall(r'"(?:[^"\\]|\\.)*"', inner)
    values = []
    for token in tokens:
        try:
            values.append(ast.literal_eval(token))
        except (ValueError, SyntaxError):
            values.append(token[1:-1])
    return values


def parse_ts_sources(ts_text: str) -> list[dict]:
    records = []
    for body in object_bodies(array_body(ts_text, "LEGAL_SOURCES")):
        records.append(normalize_source({
            "source_id": ts_string(body, "id"),
            "title": ts_string(body, "title"),
            "citation": ts_string(body, "citation"),
            "jurisdiction": ts_string(body, "jurisdiction"),
            "publisher": ts_string(body, "publisher"),
            "publication_details": ts_string(body, "publicationDetails"),
            "effective_date": ts_string(body, "effectiveDate"),
            "source_url": ts_string(body, "sourceUrl"),
            "license_note": ts_string(body, "licenseNote"),
            "verification_status": ts_string(body, "verificationStatus"),
            "version": ts_int(body, "version"),
            "last_checked_at": ts_string(body, "lastCheckedAt"),
            "retrieved_at": ts_string(body, "retrievedAt"),
        }))
    return records


def parse_ts_provisions(ts_text: str) -> list[dict]:
    records = []
    for body in object_bodies(array_body(ts_text, "LEGAL_PROVISIONS")):
        records.append(normalize_provision({
            "provision_id": ts_string(body, "id"),
            "source_id": ts_string(body, "sourceId"),
            "article_or_section": ts_string(body, "articleOrSection"),
            "heading": ts_string(body, "heading"),
            "summary": ts_string(body, "summary"),
            "context_note": ts_string(body, "contextNote"),
            "keywords": "; ".join(ts_list(body, "keywords")),
            "doc_types": "; ".join(ts_list(body, "docTypes")),
            "verification_status": ts_string(body, "verificationStatus"),
            "source_url": ts_string(body, "sourceUrl"),
            "retrieved_at": ts_string(body, "retrievedAt"),
        }))
    return records


def reconcile(rows: list[dict], reference_rows: list[dict], columns: list[str],
              id_field: str, dataset: str, prefer_reference: bool,
              issues: list[dict]) -> tuple[list[dict], list[str], int, int]:
    by_id = {row[id_field]: row for row in rows}
    reference = {row[id_field]: row for row in reference_rows}
    added, extras, mismatches = [], 0, 0
    for row_id in reference:
        if row_id not in by_id:
            by_id[row_id] = dict(reference[row_id])
            added.append(row_id)
            add_issue(issues, "WARNING", dataset, row_id, id_field,
                      "Missing from raw extract but present in application source of truth",
                      "Added from lib/legal-sources.ts", "", row_id)
    for row_id in by_id:
        if row_id not in reference:
            extras += 1
            add_issue(issues, "WARNING", dataset, row_id, id_field,
                      "Present in raw extract but not in application source of truth",
                      "Retained; extract may be newer than code", row_id, "")
    for row_id, row in by_id.items():
        if row_id not in reference:
            continue
        for column in columns:
            old = row.get(column, "")
            new = reference[row_id].get(column, "")
            if old != new:
                mismatches += 1
                add_issue(issues, "WARNING", dataset, row_id, column,
                          "Value differs from lib/legal-sources.ts",
                          "Replaced with source-of-truth value" if prefer_reference
                          else "Kept raw extract value", old, new)
                if prefer_reference:
                    row[column] = new
    order = {row_id: index for index, row_id in enumerate(reference)}
    ordered = sorted(by_id.values(),
                     key=lambda row: (order.get(row[id_field], len(order)), row[id_field]))
    return ordered, added, extras, mismatches


def check_references(provisions: list[dict], sources: list[dict],
                     issues: list[dict]) -> tuple[list[dict], list[dict]]:
    source_by_id = {row["source_id"]: row for row in sources}
    valid, orphans = [], []
    for row in provisions:
        parent = source_by_id.get(row.get("source_id", ""))
        if not parent:
            add_issue(issues, "ERROR", "provisions", row.get("provision_id", ""),
                      "source_id", "Provision references an unknown source_id",
                      "Quarantined row", row.get("source_id", ""), "")
            orphans.append({"dataset": "provisions",
                            "row_id": row.get("provision_id", ""),
                            "reason": f"Unknown source_id {row.get('source_id', '')}",
                            "row": row})
            continue
        parent_host = (urlsplit(parent.get("source_url", "")).hostname or "").lower()
        child_host = (urlsplit(row.get("source_url", "")).hostname or "").lower()
        if parent_host and child_host and parent_host != child_host:
            add_issue(issues, "WARNING", "provisions", row.get("provision_id", ""),
                      "source_url", "Provision URL host differs from parent source host",
                      "Kept with warning", row.get("source_url", ""),
                      parent.get("source_url", ""))
        valid.append(row)
    return valid, orphans


def write_csv(path: Path, columns: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns,
                                extrasaction="ignore", lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row.get(column, "") for column in columns})


def write_issues(path: Path, issues: list[dict]) -> None:
    columns = ["severity", "dataset", "row_id", "field", "issue", "action",
               "old_value", "new_value"]
    write_csv(path, columns, issues)


def bundle_payload(sources: list[dict], provisions: list[dict],
                   stats: dict, generated: str) -> dict:
    source_records = [{
        "id": row["source_id"],
        "title": row["title"],
        "citation": row["citation"],
        "jurisdiction": row["jurisdiction"],
        "publisher": row["publisher"],
        "publicationDetails": row["publication_details"],
        "effectiveDate": row["effective_date"],
        "sourceUrl": row["source_url"],
        "licenseNote": row["license_note"],
        "verificationStatus": row["verification_status"],
        "version": int(row["version"]) if row["version"].isdigit() else row["version"],
        "lastCheckedAt": row["last_checked_at"],
        "retrievedAt": row["retrieved_at"],
    } for row in sources]
    provision_records = [{
        "id": row["provision_id"],
        "sourceId": row["source_id"],
        "articleOrSection": row["article_or_section"],
        "heading": row["heading"],
        "summary": row["summary"],
        "contextNote": row["context_note"],
        "keywords": [item for item in row["keywords"].split("; ") if item],
        "docTypes": [item for item in row["doc_types"].split("; ") if item],
        "verificationStatus": row["verification_status"],
        "sourceUrl": row["source_url"],
        "retrievedAt": row["retrieved_at"],
        "verbatimQuote": None,
    } for row in provisions]
    return {
        "generatedAt": generated,
        "sources": source_records,
        "provisions": provision_records,
        "meta": stats,
    }


def online_check(urls: list[str], issues: list[dict]) -> list[tuple[str, object]]:
    import urllib.error
    import urllib.request

    results = []
    for url in urls:
        query = urllib.request.Request(
            url, method="HEAD",
            headers={"User-Agent": "HAKI-AI-dataset-cleaner/1.0"},
        )
        try:
            with urllib.request.urlopen(query, timeout=8) as response:
                status: object = response.status
        except urllib.error.HTTPError as error:
            status = error.code
        except Exception as error:
            status = f"ERROR {type(error).__name__}"
        results.append((url, status))
        if not (isinstance(status, int) and 200 <= status < 400):
            add_issue(issues, "WARNING", "sources", "", "source_url",
                      f"Live URL check returned {status}", "Review link manually",
                      url, "")
    return results


def md(value: object, limit: int = 100) -> str:
    return echo(value, limit).replace("|", "\\|")


def show_path(path: object) -> str:
    try:
        return str(Path(path).resolve().relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def build_report(started: datetime, args: argparse.Namespace, src: dict,
                 prov: dict, stats: dict, checks: list[tuple[str, str, str]],
                 changes: list[dict], issues: list[dict],
                 online: list[tuple[str, object]], outputs: list[Path],
                 report_path: Path) -> str:
    errors = sum(1 for item in issues if item["severity"] == "ERROR")
    warnings = sum(1 for item in issues if item["severity"] == "WARNING")
    corrected = sum(1 for item in issues if item["issue"].startswith("Value differs"))
    rows = [
        "# HAKI AI - Legal Dataset Cleaning Report",
        "",
        f"Generated: {started.strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        f"- Raw sources: `{show_path(src['path'])}`",
        f"- Raw provisions: `{show_path(prov['path'])}`",
        f"- Application source of truth: `{show_path(args.ts_source)}`",
        f"- Cleaned output directory: `{show_path(args.out_dir)}`",
        "",
        "## Summary",
        "",
        "| Dataset | Rows in | Rows out | Added | Dropped | Quarantined |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
        (f"| legal_sources | {stats['sources_in']} | {stats['sources_out']} | "
         f"{stats['sources_added']} | {stats['sources_dropped']} | "
         f"{stats['sources_quarantined']} |"),
        (f"| legal_provisions | {stats['provisions_in']} | {stats['provisions_out']} | "
         f"{stats['provisions_added']} | {stats['provisions_dropped']} | "
         f"{stats['provisions_quarantined']} |"),
        "",
        (f"**Result:** {errors} error(s), {warnings} warning(s), "
         f"{stats['cells_normalized']} cell(s) normalised. The raw extract was "
         f"reconciled against `lib/legal-sources.ts`: "
         f"{stats['sources_added'] + stats['provisions_added']} record(s) added and "
         f"{corrected} field value(s) refreshed."),
        "",
        "## Quality checks",
        "",
        "| Check | Sources | Provisions |",
        "| --- | --- | --- |",
    ]
    for check, source_result, provision_result in checks:
        rows.append(f"| {check} | {source_result} | {provision_result} |")
    rows += ["", "## Normalisation changes", ""]
    if changes:
        rows += ["| Dataset | Row | Field | Before | After |",
                 "| --- | --- | --- | --- | --- |"]
        for change in changes[:40]:
            rows.append(
                f"| {change['dataset']} | {md(change['row_id'])} | {change['field']} | "
                f"{md(change['before'])} | {md(change['after'])} |"
            )
        if len(changes) > 40:
            rows.append("")
            rows.append(f"_{len(changes) - 40} additional change(s) omitted._")
    else:
        rows.append("No normalisation changes were required; the raw values already "
                    "matched the canonical format.")
    rows += [
        "",
        "## Source-of-truth reconciliation",
        "",
        f"- Sources in `lib/legal-sources.ts`: {stats['ts_sources']}",
        f"- Provisions in `lib/legal-sources.ts`: {stats['ts_provisions']}",
        f"- Added from source of truth: {stats['sources_added']} source(s), "
        f"{stats['provisions_added']} provision(s)",
        f"- Field mismatches corrected: {stats['mismatches']}",
    ]
    if stats["added_ids"]:
        rows += ["", "Added records:", ""]
        for item in stats["added_ids"]:
            rows.append(f"- `{item}`")
    corrected_rows = [
        item for item in issues if item["issue"].startswith("Value differs")
    ]
    if corrected_rows:
        rows += ["", "## Values refreshed from the source of truth", "",
                 "| Dataset | Row | Field | Before | After |",
                 "| --- | --- | --- | --- | --- |"]
        for item in corrected_rows:
            rows.append(
                f"| {item['dataset']} | {md(item['row_id'])} | {item['field']} | "
                f"{md(item['old_value'], 220)} | {md(item['new_value'], 220)} |"
            )
    rows += ["", "## Issues", ""]
    if issues:
        rows += ["| Severity | Dataset | Row | Field | Issue | Action |",
                 "| --- | --- | --- | --- | --- | --- |"]
        for item in issues[:80]:
            rows.append(
                f"| {item['severity']} | {item['dataset']} | {md(item['row_id'])} | "
                f"{md(item['field'])} | {md(item['issue'])} | {md(item['action'])} |"
            )
        if len(issues) > 80:
            rows.append("")
            rows.append(f"_{len(issues) - 80} additional issue(s) omitted; see the CSV log._")
    else:
        rows.append("No issues were recorded.")
    if online:
        rows += ["", "## Live URL checks", "", "| URL | HTTP status |", "| --- | --- |"]
        for url, status in online:
            rows.append(f"| {md(url)} | {md(status)} |")
    rows += ["", "## Output files", ""]
    for path in outputs:
        rows.append(f"- `{show_path(path)}`")
    rows.append(f"- `{show_path(report_path)}`")
    rows += ["", "## Reproduce", "", "```powershell",
             "python scripts/clean_legal_dataset.py", "```", ""]
    return "\n".join(rows)


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    sources_path = Path(args.sources).resolve()
    provisions_path = Path(args.provisions).resolve()
    out_dir = Path(args.out_dir).resolve()
    report_path = Path(args.report).resolve()
    ts_path = Path(args.ts_source).resolve()
    started = datetime.now()

    print()
    print("=" * 68)
    print(" HAKI AI - LEGAL DATASET CLEANING PIPELINE")
    print("=" * 68)
    line("Started", started.strftime("%Y-%m-%d %H:%M:%S"))
    line("Raw sources", sources_path)
    line("Raw provisions", provisions_path)
    line("Cleaned output", out_dir)

    issues: list[dict] = []
    quarantined: list[dict] = []
    changes: list[dict] = []
    stats = {
        "sources_in": 0, "provisions_in": 0,
        "sources_out": 0, "provisions_out": 0,
        "sources_added": 0, "provisions_added": 0,
        "sources_dropped": 0, "provisions_dropped": 0,
        "sources_quarantined": 0, "provisions_quarantined": 0,
        "cells_normalized": 0, "mismatches": 0,
        "ts_sources": 0, "ts_provisions": 0, "added_ids": [],
    }

    step("1/8", "LOADING RAW DATA")
    try:
        src = read_rows(sources_path, SOURCE_COLUMNS)
        prov = read_rows(provisions_path, PROVISION_COLUMNS)
    except (FileNotFoundError, ValueError) as error:
        print(f"  FAILED: {error}")
        return 1
    stats["sources_in"] = len(src["rows"])
    stats["provisions_in"] = len(prov["rows"])
    line("legal_sources.csv",
         f"{len(src['rows'])} rows x {len(src['headers'])} columns ({src['encoding']})")
    line("legal_provisions.csv",
         f"{len(prov['rows'])} rows x {len(prov['headers'])} columns ({prov['encoding']})")
    for dataset, payload, columns in (("sources", src, SOURCE_COLUMNS),
                                      ("provisions", prov, PROVISION_COLUMNS)):
        for column in payload["missing"]:
            add_issue(issues, "ERROR", dataset, "", column,
                      "Expected column is missing", "Review the raw file")
            print(f"  MISSING COLUMN: {column} ({dataset})")
        if payload["extra"]:
            print(f"  Extra columns in {dataset}: {', '.join(payload['extra'])}")

    step("2/8", "REPAIRING AND NORMALISING VALUES")
    normalized_sources = [normalize_source(row) for row in src["rows"]]
    normalized_provisions = [normalize_provision(row) for row in prov["rows"]]
    for dataset, raw_rows, clean_rows, columns, id_field in (
        ("sources", src["rows"], normalized_sources, SOURCE_COLUMNS, "source_id"),
        ("provisions", prov["rows"], normalized_provisions,
         PROVISION_COLUMNS, "provision_id"),
    ):
        for raw, cleaned in zip(raw_rows, clean_rows):
            for field, old, new in changed_fields(raw, cleaned, columns):
                stats["cells_normalized"] += 1
                changes.append({"dataset": dataset,
                                "row_id": cleaned.get(id_field, ""),
                                "field": field, "before": old, "after": new})
    line("Cells normalised", stats["cells_normalized"])
    line("Date fields normalised",
         sum(1 for item in changes if item["field"] in SOURCE_DATES + PROVISION_DATES))
    line("URL fields normalised",
         sum(1 for item in changes if item["field"] == "source_url"))
    line("Status fields normalised",
         sum(1 for item in changes if item["field"] == "verification_status"))
    line("List fields normalised",
         sum(1 for item in changes if item["field"] in ("keywords", "doc_types")))

    step("3/8", "VALIDATING DATA QUALITY")
    valid_sources, bad_sources, source_summary = validate_rows(
        normalized_sources, SOURCE_COLUMNS, SOURCE_REQUIRED, SOURCE_DATES,
        "sources", "source_id", issues)
    valid_provisions, bad_provisions, provision_summary = validate_rows(
        normalized_provisions, PROVISION_COLUMNS, PROVISION_REQUIRED,
        PROVISION_DATES, "provisions", "provision_id", issues)
    quarantined.extend(bad_sources)
    quarantined.extend(bad_provisions)

    def result(failures: int, total: int) -> str:
        return "PASS" if not failures else f"FAIL ({total - failures}/{total} passed)"

    checks = [
        ("Required fields",
         result(source_summary["required"], source_summary["rows"]),
         result(provision_summary["required"], provision_summary["rows"])),
        ("ISO dates",
         result(source_summary["dates"], source_summary["rows"]),
         result(provision_summary["dates"], provision_summary["rows"])),
        ("HTTPS Kenya Law URLs",
         result(source_summary["urls"], source_summary["rows"]),
         result(provision_summary["urls"], provision_summary["rows"])),
        ("Verification status enum",
         result(source_summary["status"], source_summary["rows"]),
         result(provision_summary["status"], provision_summary["rows"])),
    ]
    for check, source_result, provision_result in checks:
        line(check, f"sources: {source_result} | provisions: {provision_result}")
    line("Rows quarantined", len(quarantined))

    step("4/8", "REMOVING DUPLICATES")
    valid_sources, dropped_sources, count_sources = dedupe_rows(
        valid_sources, "source_id", "sources", issues)
    valid_provisions, dropped_provisions, count_provisions = dedupe_rows(
        valid_provisions, "provision_id", "provisions", issues)
    stats["sources_dropped"] = count_sources
    stats["provisions_dropped"] = count_provisions
    quarantined.extend(dropped_sources)
    quarantined.extend(dropped_provisions)
    line("Duplicate source IDs", count_sources)
    line("Duplicate provision IDs", count_provisions)
    checks.append(("Unique primary keys",
                   "PASS" if not count_sources else f"FAIL ({count_sources} dropped)",
                   "PASS" if not count_provisions else f"FAIL ({count_provisions} dropped)"))

    step("5/8", "RECONCILING WITH APPLICATION SOURCE OF TRUTH")
    if args.no_sync:
        line("Reconciliation", "SKIPPED (--no-sync)")
    elif not ts_path.exists():
        line("Reconciliation", f"SKIPPED (missing {ts_path})")
        add_issue(issues, "WARNING", "repository", "", "ts_source",
                  "Source-of-truth file not found", "Skipped reconciliation",
                  ts_path, "")
    else:
        ts_text = ts_path.read_text(encoding="utf-8")
        ts_sources = parse_ts_sources(ts_text)
        ts_provisions = parse_ts_provisions(ts_text)
        stats["ts_sources"] = len(ts_sources)
        stats["ts_provisions"] = len(ts_provisions)
        prefer = not args.keep_extract_values
        valid_sources, added_sources, extra_sources, mismatch_sources = reconcile(
            valid_sources, ts_sources, SOURCE_COLUMNS, "source_id",
            "sources", prefer, issues)
        valid_provisions, added_provisions, extra_provisions, mismatch_provisions = reconcile(
            valid_provisions, ts_provisions, PROVISION_COLUMNS, "provision_id",
            "provisions", prefer, issues)
        stats["sources_added"] = len(added_sources)
        stats["provisions_added"] = len(added_provisions)
        stats["mismatches"] = mismatch_sources + mismatch_provisions
        stats["added_ids"] = [f"source: {item}" for item in added_sources]
        stats["added_ids"] += [f"provision: {item}" for item in added_provisions]
        line("lib/legal-sources.ts",
             f"{len(ts_sources)} sources, {len(ts_provisions)} provisions")
        line("Added from source of truth",
             f"{len(added_sources)} source(s), {len(added_provisions)} provision(s)")
        line("Extra in raw extract",
             f"{extra_sources} source(s), {extra_provisions} provision(s)")
        line("Field mismatches corrected", stats["mismatches"])
        for item in stats["added_ids"]:
            line("  added", item)
        for item in issues:
            if item["issue"].startswith("Value differs"):
                old = str(item["old_value"])
                new = str(item["new_value"])
                if new.startswith(old):
                    detail = "+ " + new[len(old):].lstrip("; ").strip()
                else:
                    detail = "updated (see report)"
                line(f"  fixed {item['row_id']}.{item['field']}", detail)
        checks.append(("Source-of-truth reconciliation",
                       f"{len(added_sources)} added",
                       f"{len(added_provisions)} added"))
        checks.append(("Source-of-truth coverage",
                       f"{len(valid_sources)}/{len(ts_sources)}",
                       f"{len(valid_provisions)}/{len(ts_provisions)}"))

    step("6/8", "CHECKING REFERENTIAL INTEGRITY")
    valid_provisions, orphan_provisions = check_references(
        valid_provisions, valid_sources, issues)
    quarantined.extend(orphan_provisions)
    covered = {row["source_id"] for row in valid_provisions}
    uncovered = [row["source_id"] for row in valid_sources if row["source_id"] not in covered]
    line("Valid source_id links",
         f"{len(valid_provisions)}/{len(valid_provisions) + len(orphan_provisions)}")
    line("Orphan provisions", len(orphan_provisions))
    line("Sources without provisions", len(uncovered))
    if uncovered:
        add_issue(issues, "WARNING", "sources", ", ".join(uncovered), "source_id",
                  "Source has no linked provisions", "Review coverage", "", "")
    checks.append(("Referential integrity", f"{len(valid_sources)} sources",
                   f"{len(valid_provisions)}/{len(valid_provisions) + len(orphan_provisions)} linked"))

    online_results: list[tuple[str, object]] = []
    if args.check_urls:
        unique_urls = sorted({row["source_url"] for row in valid_sources if row.get("source_url")})
        line("Live URL checks", f"{len(unique_urls)} unique URL(s)")
        online_results = online_check(unique_urls, issues)
        for url, status in online_results:
            line(f"  {url}", status)

    stats["sources_out"] = len(valid_sources)
    stats["provisions_out"] = len(valid_provisions)
    stats["sources_quarantined"] = sum(
        1 for item in quarantined if item["dataset"] == "sources")
    stats["provisions_quarantined"] = sum(
        1 for item in quarantined if item["dataset"] == "provisions")

    step("7/8", "WRITING CLEANED OUTPUTS")
    out_dir.mkdir(parents=True, exist_ok=True)
    sources_out = out_dir / "legal_sources_clean.csv"
    provisions_out = out_dir / "legal_provisions_clean.csv"
    json_out = out_dir / "legal_dataset.json"
    issues_out = out_dir / "cleaning_issues.csv"
    write_csv(sources_out, SOURCE_COLUMNS, valid_sources)
    write_csv(provisions_out, PROVISION_COLUMNS, valid_provisions)
    write_issues(issues_out, issues)
    meta = {
        "sourcesIn": stats["sources_in"],
        "sourcesOut": stats["sources_out"],
        "provisionsIn": stats["provisions_in"],
        "provisionsOut": stats["provisions_out"],
        "addedFromSourceOfTruth": stats["sources_added"] + stats["provisions_added"],
        "quarantined": len(quarantined),
    }
    payload = bundle_payload(valid_sources, valid_provisions, meta,
                             started.isoformat(timespec="seconds"))
    json_out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")
    outputs = [sources_out, provisions_out, json_out, issues_out]
    report = build_report(started, args, src, prov, stats, checks, changes,
                          issues, online_results, outputs, report_path)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(report, encoding="utf-8")
    line("legal_sources_clean.csv", f"{stats['sources_out']} rows")
    line("legal_provisions_clean.csv", f"{stats['provisions_out']} rows")
    line("legal_dataset.json",
         f"{stats['sources_out']} sources + {stats['provisions_out']} provisions")
    line("cleaning_issues.csv", f"{len(issues)} issue(s)")
    line("cleaning_report.md", "written")

    step("8/8", "SUMMARY")
    errors = sum(1 for item in issues if item["severity"] == "ERROR")
    warnings = sum(1 for item in issues if item["severity"] == "WARNING")
    line("Sources",
         f"{stats['sources_in']} -> {stats['sources_out']} "
         f"(added {stats['sources_added']}, dropped {stats['sources_dropped']}, "
         f"quarantined {stats['sources_quarantined']})")
    line("Provisions",
         f"{stats['provisions_in']} -> {stats['provisions_out']} "
         f"(added {stats['provisions_added']}, dropped {stats['provisions_dropped']}, "
         f"quarantined {stats['provisions_quarantined']})")
    line("Cells normalised", stats["cells_normalized"])
    line("Reconciliation fixes",
         f"{stats['sources_added'] + stats['provisions_added']} added, "
         f"{stats['mismatches']} refreshed")
    line("Errors", errors)
    line("Warnings", warnings)
    line("Report", report_path)
    line("RESULT", "PASS - cleaned dataset is ready for review"
         if errors == 0 else "FAIL - review the errors above")
    print()
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
