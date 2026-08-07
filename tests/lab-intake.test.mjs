import test from 'node:test';
import assert from 'node:assert/strict';

import {
  INTAKE_LIMITS,
  LabIntakeError,
  NORMALIZED_DOCUMENT_SCHEMA,
  applyOptionalSourceMetadata,
  assessSourceInputReadiness,
  canAttemptSourceUrlExtraction,
  canonicalizeUrl,
  classifyLocalFile,
  classifySourceUrl,
  createNormalizedDocument,
  detectTextFormat,
  extractTextFromHtml,
  extractTextFromRtf,
  normalizeInput,
  parseCsvTranscript,
  parseJsonTranscript,
  parsePlainText,
  parseSrt,
  parseTimestamp,
  parseVtt,
  validateNormalizedDocument
} from '../js/lab-intake.js';
import {
  LAB_DEMO_SOURCE,
  LAB_DEMO_TRANSCRIPT,
  createDemoDocument
} from '../js/lab-demo.js';
import {
  ExtractionSession,
  EXTRACTOR_DEPENDENCIES,
  SPEECH_TO_TEXT_CAPABILITY,
  readSystemClipboard,
  transcribeMedia
} from '../js/lab-extractors.js';

const FIXED_TIME = '2026-07-26T12:00:00.000Z';

test('built-in demonstration is timed, multi-speaker, and schema-valid', () => {
  const document = createDemoDocument({ createdAt: FIXED_TIME });
  assert.equal(document.schema, NORMALIZED_DOCUMENT_SCHEMA);
  assert.equal(document.source.title, LAB_DEMO_SOURCE.title);
  assert.equal(document.extraction.method, 'built-in-demo');
  assert.equal(document.segments.length, 10);
  assert.deepEqual(document.speakers, ['Maya', 'Jonah']);
  assert.equal(document.segments[0].startMs, 2_000);
  assert.equal(document.segments.at(-1).endMs, 151_000);
  assert.ok(document.segments.some((segment) =>
    segment.text.includes('Selection, compatibility, and retention')));
  assert.ok(LAB_DEMO_TRANSCRIPT.includes('82 percent'));
  assert.deepEqual(validateNormalizedDocument(document), { valid: true, errors: [] });
});

test('pasted prose becomes ordered paragraphs with deterministic segment IDs', () => {
  const input = `Attraction can open a door. It does not prove compatibility.

Retention is a different test, and no strategy creates entitlement.`;
  const first = normalizeInput({
    text: input,
    source: { title: 'Pasted note', type: 'pasted-text' },
    createdAt: FIXED_TIME
  });
  const second = normalizeInput({
    text: input,
    source: { title: 'Pasted note', type: 'pasted-text' },
    createdAt: '2026-07-27T12:00:00.000Z'
  });
  assert.equal(first.stats.segments, 2);
  assert.equal(first.stats.words, 20);
  assert.deepEqual(
    first.segments.map((segment) => segment.id),
    second.segments.map((segment) => segment.id)
  );
  assert.equal(first.id, second.id);
  assert.equal(first.segments[0].original.source, 'normalized-decoded-input');
});

test('speaker-prefixed pasted transcript recovers speakers and timestamps', () => {
  const parsed = parsePlainText(`[00:02] Ana: Attraction is not retention.
[00:06] Ben: Agreed. A lens is not a law.
[00:09] Ana: Context still matters.`);
  assert.equal(parsed.segments.length, 3);
  assert.equal(parsed.segments[0].speaker, 'Ana');
  assert.equal(parsed.segments[0].startMs, 2_000);
  assert.equal(parsed.segments[0].endMs, 6_000);
  assert.equal(parsed.segments[2].speaker, 'Ana');
});

test('SRT retains cue boundaries, speakers, and millisecond timestamps', () => {
  const srt = `1
00:00:01,250 --> 00:00:04,500
ALICE: Options are not compatibility.

2
00:00:05,000 --> 00:00:08,125
BOB: Averages are not universal binaries.`;
  const parsed = parseSrt(srt);
  assert.equal(parsed.segments.length, 2);
  assert.equal(parsed.segments[0].speaker, 'ALICE');
  assert.equal(parsed.segments[0].startMs, 1_250);
  assert.equal(parsed.segments[1].endMs, 8_125);
  assert.equal(parsed.segments[1].original.cue, 2);
  assert.ok(parsed.segments[0].original.endOffset > parsed.segments[0].original.startOffset);

  const document = normalizeInput({
    text: srt,
    format: 'srt',
    source: { title: 'SRT fixture', fileName: 'fixture.srt' },
    createdAt: FIXED_TIME
  });
  assert.deepEqual(validateNormalizedDocument(document), { valid: true, errors: [] });
});

test('VTT skips metadata blocks and reads voice tags/settings', () => {
  const vtt = `WEBVTT
Kind: captions
Language: en

NOTE generated fixture
This note should not become source text.

cue-one
00:00:00.000 --> 00:00:03.000 align:start position:0%
<v Dr. Lee>Stated preference can differ from revealed behavior.

00:00:03.500 --> 00:00:06.000
<v Sam>That is context, not destiny.`;
  const parsed = parseVtt(vtt);
  assert.equal(parsed.segments.length, 2);
  assert.equal(parsed.segments[0].speaker, 'Dr. Lee');
  assert.equal(parsed.segments[1].speaker, 'Sam');
  assert.ok(!parsed.segments.some((segment) => segment.text.includes('generated fixture')));
});

test('malformed SRT and empty VTT fail with actionable codes', () => {
  assert.throws(
    () => parseSrt('1\nnot-a-time\nHello'),
    (error) => error instanceof LabIntakeError && error.code === 'NO_SUBTITLE_CUES'
  );
  assert.throws(
    () => parseVtt('WEBVTT\n\nNOTE no cues'),
    (error) => error instanceof LabIntakeError && error.code === 'NO_SUBTITLE_CUES'
  );
});

test('reasonable JSON arrays recover timing, speakers, and skipped-record warnings', () => {
  const json = JSON.stringify({
    segments: [
      { speaker: 'Host', start_ms: 1250, end_ms: 3500, text: 'Correlation is not causation.' },
      { speaker_name: 'Guest', start: 4.25, duration: 2.5, content: 'What evidence would change the claim?' },
      { start: 7, metadata: { topic: 'ignored' } }
    ]
  });
  const parsed = parseJsonTranscript(json);
  assert.equal(parsed.segments.length, 2);
  assert.equal(parsed.segments[0].startMs, 1_250);
  assert.equal(parsed.segments[1].startMs, 4_250);
  assert.equal(parsed.segments[1].endMs, 6_750);
  assert.equal(parsed.segments[1].speaker, 'Guest');
  assert.ok(parsed.warnings.some((item) => item.code === 'JSON_RECORDS_SKIPPED'));
});

test('common speech API JSON results recover alternatives', () => {
  const parsed = parseJsonTranscript(JSON.stringify({
    results: [
      { alternatives: [{ transcript: 'First recovered utterance.' }] },
      { alternatives: [{ transcript: 'Second recovered utterance.' }] }
    ]
  }));
  assert.deepEqual(
    parsed.segments.map((segment) => segment.text),
    ['First recovered utterance.', 'Second recovered utterance.']
  );
});


test('line-delimited JSON and root word arrays are accepted', () => {
  const jsonl = [
    JSON.stringify({ speaker: 'A', start: 1, text: 'First line.' }),
    JSON.stringify({ speaker: 'B', start: 2, text: 'Second line.' })
  ].join('\n');
  assert.equal(parseJsonTranscript(jsonl).segments.length, 2);
  const words = parseJsonTranscript(JSON.stringify({ words: [{ word: 'One' }, { word: 'two' }] }));
  assert.deepEqual(words.segments.map((segment) => segment.text), ['One', 'two']);
});
test('malformed and unsupported JSON fail honestly', () => {
  assert.throws(
    () => parseJsonTranscript('{"segments": [}'),
    (error) => error instanceof LabIntakeError
      && error.code === 'INVALID_JSON'
      && /could not be parsed/i.test(error.message)
  );
  assert.throws(
    () => parseJsonTranscript('{"metadata":{"episode":3}}'),
    (error) => error instanceof LabIntakeError && error.code === 'UNSUPPORTED_JSON_SHAPE'
  );
});

test('CSV handles quoted commas, quoted newlines, speakers, and timestamps', () => {
  const csv = `speaker,start,end,text
"Host","00:00:01.000","00:00:03.500","Options, by themselves, are not compatibility."
"Guest","00:00:04.000","00:00:07.000","A second line
can remain in one quoted utterance."`;
  const parsed = parseCsvTranscript(csv);
  assert.equal(parsed.segments.length, 2);
  assert.equal(parsed.segments[0].speaker, 'Host');
  assert.equal(parsed.segments[0].startMs, 1_000);
  assert.match(parsed.segments[0].text, /Options, by themselves/);
  assert.match(parsed.segments[1].text, /second line\ncan remain/);
});

test('headerless CSV is inferred, while malformed CSV and missing text columns fail', () => {
  const inferred = parseCsvTranscript(
    `Ana,00:01,Attraction is not retention.\nBen,00:03,A lens is not a law.`
  );
  assert.equal(inferred.segments.length, 2);
  assert.equal(inferred.segments[0].speaker, 'Ana');
  assert.ok(inferred.warnings.some((item) => item.code === 'CSV_COLUMNS_INFERRED'));

  assert.throws(
    () => parseCsvTranscript('speaker,start,text\n"Host,00:01,Unclosed'),
    (error) => error instanceof LabIntakeError && error.code === 'INVALID_CSV'
  );
  assert.throws(
    () => parseCsvTranscript('speaker,start\nHost,00:01'),
    (error) => error instanceof LabIntakeError && error.code === 'CSV_TEXT_COLUMN_MISSING'
  );
});

test('HTML extraction is inert and removes scripts, handlers, forms, and page chrome', () => {
  const hostile = `<!doctype html>
  <html><head><title>Unsafe fixture</title><style>body{display:none}</style>
  <script>globalThis.PWNED = true</script></head>
  <body><nav>Navigation clutter</nav><main>
    <h1>Actual claim</h1>
    <p onclick="globalThis.PWNED=true">Attraction &lt; compatibility.</p>
    <img src=x onerror="globalThis.PWNED=true">
    <form><label>Secret</label><input value="ignore"></form>
  </main><footer>Footer clutter</footer></body></html>`;
  const extracted = extractTextFromHtml(hostile);
  assert.match(extracted, /Actual claim/);
  assert.match(extracted, /Attraction < compatibility/);
  assert.doesNotMatch(extracted, /globalThis|Navigation clutter|Footer clutter|Secret/);
  assert.equal(globalThis.PWNED, undefined);

  const document = normalizeInput({
    text: hostile,
    format: 'html',
    source: { title: 'Hostile HTML fixture' },
    createdAt: FIXED_TIME
  });
  assert.equal(document.extraction.boundarySpace, 'extracted-text');
  assert.ok(document.extraction.warnings.some((item) => item.code === 'HTML_READABLE_TEXT'));
});

test('plain malicious markup remains harmless literal text in the data contract', () => {
  const text = `<script>globalThis.PWNED = true</script>

" onmouseover="globalThis.PWNED=true">This is still transcript text.`;
  const document = normalizeInput({
    text,
    format: 'text',
    source: { title: '<img src=x onerror=alert(1)>' },
    createdAt: FIXED_TIME
  });
  assert.ok(document.text.includes('<script>'));
  assert.ok(document.source.title.includes('<img'));
  assert.equal(globalThis.PWNED, undefined);
  assert.deepEqual(validateNormalizedDocument(document), { valid: true, errors: [] });
});

test('basic RTF extraction recovers text and labels its limitations', () => {
  const document = normalizeInput({
    text: String.raw`{\rtf1\ansi Attraction is not retention.\par A lens is not a law.}`,
    format: 'rtf',
    source: { title: 'RTF fixture' },
    createdAt: FIXED_TIME
  });
  assert.match(document.text, /Attraction is not retention/);
  assert.match(document.text, /A lens is not a law/);
  assert.ok(document.extraction.warnings.some((item) => item.code === 'RTF_BASIC_EXTRACTION'));
});

test('long transcript is chunked without loss and stays within browser limits', () => {
  const sentence = 'Attraction, selection, compatibility, and retention remain distinct tests. ';
  const longText = sentence.repeat(8_000).trim();
  assert.ok(longText.length > 500_000);
  const document = normalizeInput({
    text: longText,
    source: { title: 'Long fixture' },
    createdAt: FIXED_TIME
  });
  assert.ok(document.segments.length > 20);
  assert.equal(document.text.length, longText.length);
  assert.equal(document.stats.words, 64_000);
  assert.ok(document.segments.every(
    (segment) => segment.text.length <= INTAKE_LIMITS.maxSegmentCharacters
  ));
  assert.deepEqual(validateNormalizedDocument(document), { valid: true, errors: [] });
});

test('empty and over-limit inputs are rejected before analysis', () => {
  assert.throws(
    () => normalizeInput({ text: '   \n\t  ' }),
    (error) => error instanceof LabIntakeError && error.code === 'EMPTY_INPUT'
  );
  assert.throws(
    () => normalizeInput({ text: 'x'.repeat(INTAKE_LIMITS.maxDocumentCharacters + 1) }),
    (error) => error instanceof LabIntakeError
      && error.code === 'CHARACTER_LIMIT_EXCEEDED'
      && /split/i.test(error.message)
  );
  assert.throws(
    () => createNormalizedDocument({
      source: { title: 'Oversized cue' },
      segments: [{ text: 'x'.repeat(INTAKE_LIMITS.maxSegmentCharacters + 1) }]
    }),
    (error) => error instanceof LabIntakeError
      && error.code === 'SEGMENT_CHARACTER_LIMIT_EXCEEDED'
      && /split/i.test(error.message)
  );

});

test('schema validator catches duplicates, ordering errors, and bad boundaries', () => {
  const document = createNormalizedDocument({
    source: { title: 'Validator fixture' },
    segments: [{ text: 'First claim.' }, { text: 'Second claim.' }],
    createdAt: FIXED_TIME
  });
  const broken = JSON.parse(JSON.stringify(document));
  broken.segments[1].id = broken.segments[0].id;
  broken.segments[1].order = 7;
  broken.segments[1].original.endOffset = -1;
  const result = validateNormalizedDocument(broken);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('Duplicate segment ID')));
  assert.ok(result.errors.some((message) => message.includes('invalid order')));
  assert.ok(result.errors.some((message) => message.includes('reversed excerpt')));
});

test('URL provenance routes transcript-only classes honestly and strips credentials', () => {
  const youtube = classifySourceUrl('https://youtu.be/example?t=2#comment');
  assert.equal(youtube.kind, 'youtube');
  assert.equal(youtube.canFetchText, false);
  assert.equal(youtube.requiresTranscript, true);
  assert.ok(!youtube.url.includes('#'));

  assert.equal(classifySourceUrl('https://cdn.example.com/talk.mp3').kind, 'direct-audio');
  assert.equal(classifySourceUrl('https://cdn.example.com/talk.mp4').kind, 'direct-video');
  assert.equal(classifySourceUrl('https://example.com/podcast/feed.xml').kind, 'rss');
  assert.equal(classifySourceUrl('https://example.com/article').kind, 'article');
  assert.equal(canAttemptSourceUrlExtraction('https://example.com/article'), true);
  assert.equal(canAttemptSourceUrlExtraction('https://example.com/podcast/feed.xml'), true);
  assert.equal(canAttemptSourceUrlExtraction('https://youtu.be/example'), false);
  assert.equal(canAttemptSourceUrlExtraction('https://podcasts.apple.com/us/podcast/example/id1'), false);
  assert.equal(canAttemptSourceUrlExtraction('https://cdn.example.com/talk.mp3'), false);
  assert.equal(canAttemptSourceUrlExtraction('not a URL'), false);
  assert.equal(
    canonicalizeUrl('https://user:secret@example.com/article#private'),
    'https://example.com/article'
  );
  assert.throws(
    () => classifySourceUrl('javascript:alert(1)'),
    (error) => error instanceof LabIntakeError && error.code === 'UNSAFE_SOURCE_URL'
  );
});

test('source readiness separates blocking URL errors from optional metadata warnings', () => {
  const malformedOnly = assessSourceInputReadiness({ sourceUrl: 'not a URL' });
  assert.equal(malformedOnly.canAnalyze, false);
  assert.equal(malformedOnly.urlState, 'blocking-error');
  assert.equal(malformedOnly.blockingUrlError?.code, 'INVALID_SOURCE_URL');
  assert.equal(malformedOnly.provenanceUrl, null);

  const malformedWithText = assessSourceInputReadiness({
    sourceUrl: 'not a URL',
    text: 'A supplied transcript remains the analyzable layer.'
  });
  assert.equal(malformedWithText.canAnalyze, true);
  assert.equal(malformedWithText.urlState, 'warning');
  assert.equal(malformedWithText.metadataUrlWarning?.code, 'INVALID_SOURCE_URL');
  assert.equal(malformedWithText.retrievalEligible, false);
  assert.equal(malformedWithText.provenanceUrl, null);

  const document = normalizeInput({
    text: 'A normalized local document remains analyzable.',
    source: { title: 'Local document', type: 'text-file' },
    createdAt: FIXED_TIME
  });
  assert.equal(assessSourceInputReadiness({
    sourceUrl: 'not a URL',
    normalizedDocument: document
  }).canAnalyze, true);
  assert.equal(assessSourceInputReadiness({
    sourceUrl: 'not a URL',
    companionFile: { name: 'talk.vtt' }
  }).canAnalyze, true);
});

test('valid provenance-only URLs retain their existing eligibility contract', () => {
  for (const sourceUrl of [
    'https://youtu.be/example',
    'https://podcasts.apple.com/us/podcast/example/id1',
    'https://cdn.example.com/talk.mp3'
  ]) {
    const provenanceOnly = assessSourceInputReadiness({ sourceUrl });
    assert.equal(provenanceOnly.canAnalyze, false);
    assert.equal(provenanceOnly.retrievalEligible, false);
    assert.equal(provenanceOnly.provenanceUrl, sourceUrl);

    const withText = assessSourceInputReadiness({
      sourceUrl,
      text: 'A supplied transcript remains the analyzable layer.'
    });
    assert.equal(withText.canAnalyze, true);
    assert.equal(withText.provenanceUrl, sourceUrl);
  }

  const mediaWithCompanion = assessSourceInputReadiness({
    sourceUrl: 'https://cdn.example.com/talk.mp4',
    companionFile: { name: 'talk.vtt' }
  });
  assert.equal(mediaWithCompanion.canAnalyze, true);
  assert.equal(mediaWithCompanion.provenanceUrl, 'https://cdn.example.com/talk.mp4');

  const podcastWithDocument = assessSourceInputReadiness({
    sourceUrl: 'https://podcasts.apple.com/us/podcast/example/id1',
    normalizedDocument: { schema: NORMALIZED_DOCUMENT_SCHEMA }
  });
  assert.equal(podcastWithDocument.canAnalyze, true);
  assert.equal(
    podcastWithDocument.provenanceUrl,
    'https://podcasts.apple.com/us/podcast/example/id1'
  );

  for (const sourceUrl of [
    'https://example.com/article',
    'https://example.com/podcast/feed.xml'
  ]) {
    const readiness = assessSourceInputReadiness({ sourceUrl });
    assert.equal(readiness.canAnalyze, true);
    assert.equal(readiness.retrievalEligible, true);
  }

  const corrected = assessSourceInputReadiness({
    sourceUrl: 'https://example.com/corrected',
    text: 'The same transcript remains ready.'
  });
  assert.equal(corrected.urlState, 'valid');
  assert.equal(corrected.metadataUrlWarning, null);
  assert.equal(corrected.provenanceUrl, 'https://example.com/corrected');
});

test('optional source metadata excludes malformed provenance from normalized documents', () => {
  const document = normalizeInput({
    text: 'Valid text should survive invalid optional metadata.',
    source: {
      title: 'Sanitization fixture',
      type: 'pasted-text',
      url: 'https://example.com/original'
    },
    createdAt: FIXED_TIME
  });
  const invalid = applyOptionalSourceMetadata(document, {
    sourceUrl: 'not a URL'
  });
  assert.equal(invalid.source.url, null);
  assert.equal(invalid.text, document.text);

  const retained = applyOptionalSourceMetadata(document);
  assert.equal(retained.source.url, 'https://example.com/original');

  const valid = applyOptionalSourceMetadata(document, {
    sourceUrl: 'https://youtu.be/example'
  });
  assert.equal(valid.source.url, 'https://youtu.be/example');
});

test('format and local-file classifiers cover required intake families', () => {
  assert.equal(detectTextFormat({ fileName: 'talk.SRT' }), 'srt');
  assert.equal(detectTextFormat({ mimeType: 'text/vtt' }), 'vtt');
  assert.equal(detectTextFormat({ text: '{"segments":[]}' }), 'json');
  assert.equal(classifyLocalFile({ name: 'episode.m4a', type: 'audio/mp4' }).kind, 'media');
  assert.equal(classifyLocalFile({ name: 'scan.pdf', type: '' }).kind, 'pdf');
  assert.equal(classifyLocalFile({ name: 'screen.png', type: 'image/png' }).kind, 'image');
  assert.equal(classifyLocalFile({ name: 'notes.docx', type: '' }).kind, 'unsupported-document');
});

test('timestamps distinguish seconds, minute clocks, and full clocks', () => {
  assert.equal(parseTimestamp(2.5), 2_500);
  assert.equal(parseTimestamp('01:02'), 62_000);
  assert.equal(parseTimestamp('01:02:03.045'), 3_723_045);
  assert.equal(parseTimestamp('00:99'), null);
  assert.equal(parseTimestamp('not-a-time'), null);
});

test('optional extractor dependencies are exact pinned and scripts have SRI', () => {
  for (const dependency of Object.values(EXTRACTOR_DEPENDENCIES)) {
    assert.match(dependency.scriptUrl, new RegExp(`@${dependency.version.replaceAll('.', '\\.')}/`));
    assert.match(dependency.scriptIntegrity, /^sha384-[A-Za-z0-9+/]+=*$/);
  }
  assert.match(EXTRACTOR_DEPENDENCIES.pdfjs.workerUrl, /@3\.11\.174\//);
  assert.match(EXTRACTOR_DEPENDENCIES.tesseract.workerUrl, /@5\.1\.1\//);
  assert.match(EXTRACTOR_DEPENDENCIES.tesseract.corePath, /@5\.1\.1$/);
  assert.match(EXTRACTOR_DEPENDENCIES.tesseract.languagePath, /@1\.0\.0\//);
});

test('media adapter never claims speech-to-text support', () => {
  assert.equal(SPEECH_TO_TEXT_CAPABILITY.available, false);
  assert.equal(SPEECH_TO_TEXT_CAPABILITY.sendsMediaOffDevice, false);
  assert.throws(
    () => transcribeMedia(),
    (error) => error.name === 'LabIntakeError'
      && error.code === 'LOCAL_STT_NOT_SHIPPED'
  );
});

test('extraction session reset aborts active work and runs cleanup hooks', async () => {
  const events = [];
  const session = new ExtractionSession({ onProgress: (event) => events.push(event) });
  const signal = session.begin();
  let cleaned = false;
  session.trackCleanup(() => {
    cleaned = true;
  });
  await session.reset();
  assert.equal(signal.aborted, true);
  assert.equal(cleaned, true);
  assert.ok(events.some((event) => event.phase === 'reset' && event.status === 'success'));
});

test('system clipboard adapter fails soft outside a browser', async () => {
  await assert.rejects(
    () => readSystemClipboard(),
    (error) => error.name === 'LabIntakeError'
      && error.code === 'CLIPBOARD_API_UNAVAILABLE'
  );
});

test('the no-DOM HTML fallback decodes the same typographic entities the corpus extractor does', () => {
  /*
   * Red before v2.6.21 (pt09 adversarial lane, surface: intake
   * normalization). `htmlToTextWithDom` runs in the browser and a DOM decodes
   * every HTML entity there is. `htmlToTextFallback` runs everywhere else —
   * the headless harness, this suite, every corpus capture — and its
   * `decodeEntities` knew six names: amp, apos, gt, lt, nbsp, quot.
   *
   * So the Lab and its own measuring instrument read different text. Measured
   * over the 13 archived sources that keep their raw HTML, 89 named entities
   * survive extraction in the Node path and none survive in the browser:
   * &rsquo; x19, &ldquo; x17, &rdquo; x17, &hellip; x13, &raquo; x13,
   * &laquo; x3, &mdash; x3, &copy; x2, &larr;, &rarr;.
   *
   * `doesn&rsquo;t` is the one that matters most: it tokenizes to
   * doesn / rsquo / t, so the passage stops containing the contradiction cue
   * `doesn't` at all, and an entity name enters the token stream as a word.
   *
   * The floor asserted here is the repo's own: `tools/extract-source-text.mjs`
   * already decodes this exact set, because the corpus archive could not be
   * read without it.
   */
  const decoded = extractTextFromHtml(
    '<p>She &ldquo;doesn&rsquo;t&rdquo; date up &mdash; or down &ndash; anymore&hellip;</p>'
    + '<p>&laquo;Nope&raquo; &copy; 2026 &larr; &rarr; &lsquo;quoted&rsquo;</p>'
  );
  assert.equal(/&[a-z]+;/i.test(decoded), false, `no named entity survives extraction: ${decoded}`);
  assert.match(decoded, /“doesn’t”/);
  assert.match(decoded, /date up — or down – anymore…/);
  assert.match(decoded, /«Nope» © 2026 ← → ‘quoted’/);
});

test('format characters that carry no text are removed at intake', () => {
  /*
   * Red before v2.6.21 (pt09 adversarial lane, surface: zero-width
   * and format characters). `cleanControlCharacters` removed C0 and DEL and
   * stripped a LEADING U+FEFF, and nothing removed the Unicode format
   * characters that a real paste carries: the soft hyphen a justified page
   * emits (`&shy;`), a zero-width space from a CMS, a word joiner, a BOM that
   * is not at position 0, and the bidi isolates a right-to-left quotation
   * leaves behind.
   *
   * They are invisible to a reader and load-bearing to the tokenizer: the
   * token regex is `[\p{L}\p{N}]+`, so one of them inside a word splits it in
   * two. "hypergamy" with a U+200B in the middle scored 0.562 against
   * pills:page-rp:hypergamy where the clean form scored 0.747 — a silent
   * degradation with nothing in the output saying a character did it.
   *
   * ZWNJ and ZWJ (U+200C/U+200D) are deliberately kept: they are orthographic
   * in Persian and several Indic scripts and structural inside emoji
   * sequences, so removing them would corrupt text a reader can see. Inside a
   * Latin word they remain a way to hide from the matcher, and that is
   * recorded rather than fixed.
   */
  const parsed = parsePlainText(
    'Hyper\u00adgamy is not the same as hyper\u200bgamy or hyper\u2060gamy or hyper\ufeffgamy.\n'
    + '\u202bA right-to-left run\u202c ends here.'
  );
  const text = parsed.segments.map((segment) => segment.text).join('\n');
  assert.equal(/[\u00ad\u200b\u2060\ufeff\u202a-\u202e\u200e\u200f\u2066-\u2069]/.test(text), false,
    `no zero-width or bidi format character survives intake: ${JSON.stringify(text)}`);
  assert.match(text, /Hypergamy is not the same as hypergamy or hypergamy or hypergamy\./);
  assert.match(text, /A right-to-left run ends here\./);
});

test('an RTF header table is not transcript text', () => {
  /*
   * Red before v2.6.21 (pt09 adversarial lane, surface: intake format
   * edges). RTF is an advertised intake format and `extractTextFromRtf` strips
   * control words and braces without ever recognising a DESTINATION group — the
   * sub-documents an RTF carries that are not the document. Every real
   * Word-generated file opens with several.
   *
   * Repro, a Word 2019 file's own preamble:
   *
   *   {\\rtf1\\ansi…{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}{\\f1…Symbol;}}
   *   {\\colortbl ;\\red0\\green0\\blue255;}{\\*\\generator Riched20 10.0.19041;}…
   *
   * extracted as: "Calibri;Symbol;;;\\*Riched20 10.0.19041;She wanted a
   * provider who could support a household." — four junk tokens in front of the
   * first sentence, an inflated word count, and a corrupted excerpt for every
   * passage a reader is shown.
   *
   * Only the non-prose destinations are dropped. Headers, footers and footnotes
   * hold text a reader wrote and stay in.
   */
  const word = String.raw`{\rtf1\ansi\ansicpg1252\deff0\nouicompat{\fonttbl{\f0\fnil\fcharset0 Calibri;}{\f1\fnil\fcharset2 Symbol;}}{\colortbl ;\red0\green0\blue255;}{\*\generator Riched20 10.0.19041;}\viewkind4\uc1\pard\sa200\sl276\slmult1\f0\fs22\lang9 She wanted a provider who could support a household.\par}`;
  assert.equal(
    extractTextFromRtf(word),
    'She wanted a provider who could support a household.',
  );
  // A nested group that is NOT a destination keeps its text.
  assert.equal(
    extractTextFromRtf(String.raw`{\rtf1\ansi {\b She} wanted a provider.\par}`),
    'She wanted a provider.',
  );
  // Escaped braces are literal text, not group boundaries.
  assert.equal(
    extractTextFromRtf(String.raw`{\rtf1\ansi She wanted \{a provider\}.\par}`),
    'She wanted {a provider}.',
  );
});
