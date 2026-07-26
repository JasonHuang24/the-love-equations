/*
 * LE Lab export adapters.
 * These functions serialize the versioned analysis result; they never rebuild
 * findings from UI state. User excerpts are HTML-escaped in Markdown so a
 * transcript containing tags remains inert in downstream renderers.
 */

function text(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function markdownText(value) {
  return text(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownLink(label, href) {
  const safeLabel = markdownText(label).replace(/\]/g, '\\]');
  const safeHref = String(href || '').replace(/[()\s]/g, (character) =>
    character === ' ' ? '%20' : `\\${character}`);
  return href ? `[${safeLabel}](${safeHref})` : safeLabel;
}

function percent(value) {
  return `${Number(value || 0).toFixed(1).replace(/\.0$/, '')}%`;
}

function timestampLabel(item) {
  const start = item?.location?.startTime ?? item?.startTime;
  if (start == null || start === '') return '';
  if (typeof start === 'string') return start;
  const seconds = Number(start);
  if (!Number.isFinite(seconds)) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = Math.floor(seconds % 60);
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function sourceLine(result) {
  const source = result.source || {};
  const parts = [markdownText(source.title || 'Untitled source')];
  if (source.type) parts.push(markdownText(source.type));
  if (source.url) parts.push(markdownLink(source.url, source.url));
  return parts.join(' · ');
}

export function analysisToMarkdown(result) {
  if (!result) throw new Error('There is no analysis to export.');
  const metrics = result.metrics || {};
  const coverage = result.coverage || {};
  const lines = [
    '# The Love Equations Lab — Analysis',
    '',
    `- **Source:** ${sourceLine(result)}`,
    `- **Analysis ID:** \`${markdownText(result.id)}\``,
    `- **Generated:** ${markdownText(result.generatedAt)}`,
    `- **Mode:** ${markdownText(result.analysisMode?.label || result.analysisMode?.id)}`,
    `- **Canon index:** ${markdownText(result.canonIndex?.version)} · ${result.canonIndex?.conceptCount || 0} concepts across ${result.canonIndex?.sourceCount || 0} LE sources`,
    `- **Schema:** \`${markdownText(result.schemaVersion)}\``,
    '',
    '> Coverage percentages describe this document, not a population and not whether a claim is true.',
    '',
    '## Coverage',
    '',
    `- ${Number(metrics.totalWords || 0).toLocaleString()} source words`,
    `- ${Number(metrics.sourceSegments || 0).toLocaleString()} normalized source segments`,
    `- ${Number(metrics.claimLikeSegments || 0).toLocaleString()} detected claim-like segments`,
    `- ${Number(metrics.mappedClaimSegments || 0).toLocaleString()} mapped · ${Number(metrics.unmappedClaimSegments || 0).toLocaleString()} unmapped`,
    `- **Mapped claim share:** ${percent(coverage.mappedClaimSegmentSharePct)}`,
    `- **Mapped claim-word share:** ${percent(coverage.mappedClaimWordSharePct)}`,
    '',
  ];

  if (result.source?.extractionWarnings?.length) {
    lines.push('## Extraction warnings', '');
    result.source.extractionWarnings.forEach((warning) => {
      const message = typeof warning === 'string' ? warning : warning.message || JSON.stringify(warning);
      lines.push(`- ${markdownText(message)}`);
    });
    lines.push('');
  }

  lines.push('## Strongest canon matches', '');
  if (!result.strongestMatches?.length) {
    lines.push('_No canon concept cleared the credible-match threshold._', '');
  } else {
    result.strongestMatches.forEach((match, index) => {
      lines.push(
        `### ${index + 1}. ${markdownLink(match.title, match.href)}`,
        '',
        `**${markdownText(match.confidence)} confidence · ${(Number(match.bestScore || 0) * 100).toFixed(0)} lexical score · ${markdownText(match.category)} · ${markdownText(match.evidenceType)}**`,
        '',
        markdownText(match.synopsis),
        '',
      );
      match.excerpts?.slice(0, 2).forEach((excerpt) => {
        lines.push(`> ${markdownText(excerpt)}`, '');
      });
      if (match.sourceLinks?.length) {
        lines.push(`LE sources: ${match.sourceLinks.map((source) => markdownLink(source.label, source.url)).join(' · ')}`, '');
      }
    });
  }

  lines.push('## Passage map', '');
  const mapped = (result.segments || []).filter((segment) => segment.mapped);
  if (!mapped.length) {
    lines.push('_No mapped passages._', '');
  } else {
    mapped.forEach((segment) => {
      const location = [
        segment.unit?.speaker,
        timestampLabel(segment.unit),
        segment.unit?.id,
      ].filter(Boolean).map(markdownText).join(' · ');
      lines.push(
        `### ${location || markdownText(segment.unit?.id)}`,
        '',
        `> ${markdownText(segment.unit?.text)}`,
        '',
      );
      segment.matches.forEach((match) => {
        lines.push(
          `- **${markdownText(match.alignment?.label)} · ${markdownText(match.confidence)} (${(Number(match.score || 0) * 100).toFixed(0)})** — ${markdownLink(match.title, match.href)}. ${markdownText(match.why)}`,
        );
        if (match.whyMatched?.length) {
          lines.push(`  - Match trace: ${match.whyMatched.map(markdownText).join('; ')}`);
        }
      });
      lines.push('');
    });
  }

  lines.push('## Pressure tests', '');
  if (!result.pressureTests?.length) {
    lines.push('_No prioritized pressure test was triggered._', '');
  } else {
    result.pressureTests.forEach((pressure, index) => {
      lines.push(
        `### ${index + 1}. ${markdownText(pressure.failureMode)}`,
        '',
        `- **Tension:** ${markdownText(pressure.tensionType)} — ${markdownText(pressure.interpretation)}`,
        `- **LE rule:** ${markdownLink(pressure.canonRule?.title, pressure.canonRule?.href)} — ${markdownText(pressure.canonRule?.synopsis)}`,
        `- **Source:** “${markdownText(pressure.sourceExcerpt)}”`,
        `- **Boundary conditions:** ${(pressure.boundaryConditions || []).map(markdownText).join('; ')}`,
        `- **Strain scenario:** ${markdownText(pressure.strainScenario)}`,
        `- **Evidence that would change the conclusion:** ${markdownText(pressure.evidenceThatWouldChangeConclusion)}`,
        `- **Did the input supply it?** ${markdownText(pressure.inputEvidenceAssessment)}`,
        '',
      );
    });
  }

  lines.push(researchQueueToMarkdown(result, { includeHeading: true }), '');
  lines.push('## Limitations', '');
  (result.limitations || []).forEach((limitation) => lines.push(`- ${markdownText(limitation)}`));
  lines.push('');
  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}

export function researchQueueToMarkdown(result, { includeHeading = true } = {}) {
  const queue = result?.researchQueue || result;
  const lines = [];
  if (includeHeading) lines.push('## Unmapped research queue', '', '_Research candidates — not new LE doctrine._', '');
  if (!queue?.items?.length) {
    lines.push('_No unmapped claim-like passages in this analysis._');
    return lines.join('\n');
  }
  queue.items.forEach((item, index) => {
    const location = [
      item.location?.speaker,
      timestampLabel(item),
      item.segmentId,
    ].filter(Boolean).map(markdownText).join(' · ');
    lines.push(
      `### RQ ${index + 1} · ${markdownText(item.suggestedDestination)}`,
      '',
      `> ${markdownText(item.excerpt)}`,
      '',
      `- **Location:** ${location || markdownText(item.segmentId)}`,
      `- **Why unmapped:** ${markdownText(item.whyUnmapped)}`,
      `- **Nearest LE concepts:** ${item.nearestConcepts?.length
        ? item.nearestConcepts.map((nearest) => `${markdownLink(nearest.title, nearest.href)} (${(Number(nearest.score || 0) * 100).toFixed(0)})`).join(' · ')
        : 'No defensible neighbor'}`,
      `- **Empirical question:** ${markdownText(item.empiricalQuestion)}`,
      `- **Suggested search terms:** ${(item.suggestedSearchTerms || []).map((term) => `\`${markdownText(term).replace(/`/g, '\\`')}\``).join(', ')}`,
      `- **What would falsify it:** ${markdownText(item.falsifier)}`,
      `- **Risk flags:** ${(item.riskFlags || []).map(markdownText).join(', ')}`,
      '',
    );
  });
  return lines.join('\n');
}

export function analysisToJson(result, { pretty = true } = {}) {
  if (!result) throw new Error('There is no analysis to export.');
  return JSON.stringify(result, null, pretty ? 2 : 0);
}

export function researchQueueToJson(result, { pretty = true } = {}) {
  if (!result) throw new Error('There is no research queue to export.');
  const payload = {
    schemaVersion: 'le-lab.research-queue/1.0',
    analysisId: result.id,
    generatedAt: result.generatedAt,
    source: result.source,
    canonIndex: result.canonIndex,
    analysisMode: result.analysisMode,
    extractionWarnings: result.source?.extractionWarnings || [],
    queue: result.researchQueue,
    limitations: result.limitations,
  };
  return JSON.stringify(payload, null, pretty ? 2 : 0);
}

export function exportFileName(result, suffix, extension) {
  const source = text(result?.source?.title || 'source')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 54) || 'source';
  return `le-lab-${source}-${suffix}.${extension}`;
}

export function downloadTextFile(contents, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
