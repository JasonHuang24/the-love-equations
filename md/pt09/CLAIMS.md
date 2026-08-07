# PT09 claims ledger

Append-only. One line per input: `- [agent] [lane] [source-URL-or-attack-family] [status]`.
Re-read this file immediately before appending. Statuses: claimed → analyzed → verdict(covered|gap|instrument|novel|bug|clean).
Keep this file UTF-8.
