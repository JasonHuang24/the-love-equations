/**
 * LE Lab intake and normalization core.
 *
 * This module is intentionally dependency-free and has no DOM writes. User
 * content remains plain strings; renderers must use textContent, never
 * innerHTML. Browser-only file/PDF/OCR/media adapters live in
 * `lab-extractors.js`.
 */

export const NORMALIZED_DOCUMENT_SCHEMA = 'le-lab.normalized-document';
export const NORMALIZED_DOCUMENT_SCHEMA_VERSION = '1.0.0';

export const INTAKE_LIMITS = Object.freeze({
  maxTextFileBytes: 12 * 1024 * 1024,
  maxDocumentCharacters: 2_000_000,
  maxSegments: 20_000,
  maxSegmentCharacters: 24_000,
  maxSourceTitleCharacters: 300,
  maxUrlCharacters: 2_048,
  maxPdfBytes: 40 * 1024 * 1024,
  maxImageBytes: 20 * 1024 * 1024,
  maxImagePixels: 40_000_000,
  maxMediaBytes: 2 * 1024 * 1024 * 1024,
  maxRemoteTextBytes: 12 * 1024 * 1024
});

export const TEXT_FORMATS = Object.freeze([
  'text',
  'markdown',
  'srt',
  'vtt',
  'json',
  'csv',
  'html',
  'rtf'
]);

const TEXT_EXTENSIONS = new Map([
  ['txt', 'text'],
  ['text', 'text'],
  ['md', 'markdown'],
  ['markdown', 'markdown'],
  ['srt', 'srt'],
  ['vtt', 'vtt'],
  ['json', 'json'],
  ['jsonl', 'json'],
  ['csv', 'csv'],
  ['tsv', 'csv'],
  ['html', 'html'],
  ['htm', 'html'],
  ['rtf', 'rtf']
]);

const VIDEO_EXTENSIONS = new Set([
  'mp4', 'm4v', 'webm', 'mov', 'ogv', 'avi', 'mkv'
]);

const AUDIO_EXTENSIONS = new Set([
  'mp3', 'm4a', 'aac', 'wav', 'ogg', 'oga', 'opus', 'flac', 'webm'
]);

const TEXT_FIELD_NAMES = [
  'text', 'transcript', 'content', 'utterance', 'caption', 'sentence',
  'body', 'value', 'line', 'word'
];

const SPEAKER_FIELD_NAMES = [
  'speaker', 'speaker_name', 'speakername', 'name', 'participant', 'voice'
];

const START_FIELD_NAMES = [
  'startms', 'start_ms', 'starttime', 'start_time', 'start', 'timestamp',
  'time', 'offset'
];

const END_FIELD_NAMES = [
  'endms', 'end_ms', 'endtime', 'end_time', 'end', 'stop'
];

const DURATION_FIELD_NAMES = ['durationms', 'duration_ms', 'duration'];

const BLOCK_TAGS = [
  'address', 'article', 'aside', 'blockquote', 'br', 'dd', 'div', 'dl',
  'dt', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5',
  'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
];

export class LabIntakeError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LabIntakeError';
    this.code = code;
    this.details = details;
  }
}

/*
 * Characters a reader cannot see and the tokenizer cannot ignore.
 *
 * The C0 range and DEL were always removed here. The Unicode FORMAT
 * characters were not, and they are the ones a real paste actually carries:
 * a soft hyphen from a justified page (`&shy;`), a zero-width space from a
 * CMS, a word joiner, a BOM anywhere but position 0, and the bidi embedding
 * and isolate controls a right-to-left quotation leaves behind. None of them
 * is text, and every one of them splits a word, because the token regex is
 * `[\p{L}\p{N}]+`: "hypergamy" with one U+200B in the middle scored 0.562
 * against pills:page-rp:hypergamy where the clean form scores 0.747, and
 * nothing in the output said a character had done it.
 *
 * ZWNJ and ZWJ (U+200C/U+200D) are deliberately NOT in this class. They are
 * orthographic in Persian and several Indic scripts and structural inside
 * emoji sequences, so removing them would corrupt text a reader can see.
 * Inside a Latin word they stay a way to hide from the matcher; that residual
 * is recorded rather than paid for with someone else's spelling.
 */
// U+2028 and U+2029 are absent on purpose: they are line breaks, not
// invisible padding, and normalizeLineEndings is where a line break belongs.

const FORMAT_CHARACTERS = /[\u00ad\u200b\u200e\u200f\u202a-\u202e\u2060-\u2064\u2066-\u206f\ufeff]/g;
function cleanControlCharacters(value) {
  return String(value ?? '')
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(FORMAT_CHARACTERS, '');
}

export function normalizeLineEndings(value) {
  return cleanControlCharacters(value)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n');
}

function cleanInlineText(value, max = INTAKE_LIMITS.maxSegmentCharacters) {
  return cleanControlCharacters(value)
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()
    .slice(0, max);
}

function cleanSourceTitle(value, fallback = 'Untitled source') {
  const title = cleanControlCharacters(value)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, INTAKE_LIMITS.maxSourceTitleCharacters);
  return title || fallback;
}

function warning(code, message, severity = 'warning', details = {}) {
  return { code, message, severity, ...details };
}

function normalizeWarnings(values = []) {
  return values.map((item) => {
    if (typeof item === 'string') return warning('EXTRACTION_NOTE', item);
    return warning(
      cleanInlineText(item?.code || 'EXTRACTION_NOTE', 80),
      cleanInlineText(item?.message || 'Extraction note.', 1_000),
      ['info', 'warning', 'error'].includes(item?.severity) ? item.severity : 'warning',
      item?.details && typeof item.details === 'object' ? { details: item.details } : {}
    );
  });
}

export function countWords(value) {
  const matches = cleanControlCharacters(value).match(
    /[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu
  );
  return matches ? matches.length : 0;
}

export function stableHash(value) {
  const text = String(value ?? '');
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(7, '0');
}

function extensionOf(name = '') {
  const match = String(name).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
}

export function detectTextFormat({ fileName = '', mimeType = '', text = '' } = {}) {
  const extension = extensionOf(fileName);
  if (TEXT_EXTENSIONS.has(extension)) return TEXT_EXTENSIONS.get(extension);

  const mime = String(mimeType).toLowerCase().split(';')[0].trim();
  if (mime === 'text/vtt') return 'vtt';
  if (mime === 'application/x-subrip') return 'srt';
  if (mime === 'text/markdown') return 'markdown';
  if (mime === 'application/json' || mime.endsWith('+json')) return 'json';
  if (mime === 'text/csv' || mime === 'text/tab-separated-values') return 'csv';
  if (mime === 'text/html' || mime === 'application/xhtml+xml') return 'html';
  if (mime === 'application/rtf' || mime === 'text/rtf') return 'rtf';

  const sample = normalizeLineEndings(text).slice(0, 2_000).trimStart();
  if (/^WEBVTT(?:\s|$)/i.test(sample)) return 'vtt';
  if (/^\d+\s*\n\d\d?:\d\d(?::\d\d)?[,.]\d{1,3}\s+-->/m.test(sample)) return 'srt';
  if (/^[\[{]/.test(sample)) {
    try {
      JSON.parse(sample.length === normalizeLineEndings(text).trim().length
        ? sample
        : normalizeLineEndings(text));
      return 'json';
    } catch {
      // A leading brace alone is not enough to call prose malformed JSON.
    }
  }
  return 'text';
}

export function classifyLocalFile(file = {}) {
  const name = String(file.name || '');
  const extension = extensionOf(name);
  const mime = String(file.type || '').toLowerCase().split(';')[0].trim();

  if (extension === 'pdf' || mime === 'application/pdf') {
    return { kind: 'pdf', format: 'pdf', extension, mimeType: mime };
  }
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff'].includes(extension)) {
    return { kind: 'image', format: extension || mime.slice(6), extension, mimeType: mime };
  }
  if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(extension)) {
    return { kind: 'media', mediaType: 'video', format: extension || mime.slice(6), extension, mimeType: mime };
  }
  if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(extension)) {
    return { kind: 'media', mediaType: 'audio', format: extension || mime.slice(6), extension, mimeType: mime };
  }
  if (TEXT_EXTENSIONS.has(extension) || mime.startsWith('text/') || mime.includes('json') || mime.includes('rtf')) {
    return {
      kind: 'text',
      format: detectTextFormat({ fileName: name, mimeType: mime }),
      extension,
      mimeType: mime
    };
  }
  if (['doc', 'docx', 'odt', 'pages'].includes(extension)) {
    return { kind: 'unsupported-document', format: extension, extension, mimeType: mime };
  }
  return { kind: 'unknown', format: extension || 'unknown', extension, mimeType: mime };
}

export function parseTimestamp(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value * 1_000));
  }

  const input = String(value).trim().replace(',', '.');
  if (/^\d+(?:\.\d+)?$/.test(input)) {
    return Math.max(0, Math.round(Number(input) * 1_000));
  }

  const parts = input.match(/^(?:(\d{1,3}):)?(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (!parts) return null;
  const hours = Number(parts[1] || 0);
  const minutes = Number(parts[2] || 0);
  const seconds = Number(parts[3] || 0);
  const millis = Number((parts[4] || '').padEnd(3, '0') || 0);
  if (minutes > 59 || seconds > 59) return null;
  return hours * 3_600_000 + minutes * 60_000 + seconds * 1_000 + millis;
}

function parseFlexibleTime(value, fieldName = '') {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const isMilliseconds = /(?:^|_)ms$|ms$/i.test(fieldName);
    return Math.max(0, Math.round(isMilliseconds ? value : value * 1_000));
  }
  return parseTimestamp(value);
}

/*
 * The named entities the no-DOM path has to know.
 *
 * In the browser `htmlToTextWithDom` runs and a DOM decodes everything. This
 * table is what the FALLBACK knows, and the fallback is what the headless
 * harness, the test suite and every corpus capture run on — so a name missing
 * here means the Lab and its own measuring instrument read different text.
 *
 * The set is not a guess. `tools/extract-source-text.mjs` already decodes the
 * typographic half of it, because the corpus archive could not be read
 * without it; the rest are the names measured surviving extraction across the
 * archived raw HTML (&raquo;, &laquo;, &copy;, &larr;, &rarr;) plus the
 * Latin-1 letters, which any article carrying a European name will contain.
 * `doesn&rsquo;t` was the expensive one: undecoded it tokenizes to
 * doesn/rsquo/t, so the passage stops containing the contradiction cue
 * `doesn't` and an entity name enters the token stream as a word.
 */
const HTML_NAMED_ENTITIES = Object.freeze({
  amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"',
  // Typography — the set tools/extract-source-text.mjs already required.
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  sbquo: '‚', bdquo: '„', ndash: '–', mdash: '—',
  hellip: '…', prime: '′', Prime: '″', bull: '•',
  middot: '·', dagger: '†', Dagger: '‡', permil: '‰',
  laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›',
  ensp: ' ', emsp: ' ', thinsp: ' ', shy: '­', zwnj: '‌', zwj: '‍',
  // Symbols that appear in prose and in the recirculation furniture around it.
  copy: '©', reg: '®', trade: '™', deg: '°', sect: '§',
  para: '¶', plusmn: '±', times: '×', divide: '÷',
  minus: '−', ne: '≠', le: '≤', ge: '≥',
  frac12: '½', frac14: '¼', frac34: '¾',
  larr: '←', uarr: '↑', rarr: '→', darr: '↓', harr: '↔',
  euro: '€', pound: '£', yen: '¥', cent: '¢',
  // Latin-1 letters, so a name keeps its shape and its tokens.
  Aacute: 'Á', aacute: 'á', Agrave: 'À', agrave: 'à',
  Acirc: 'Â', acirc: 'â', Atilde: 'Ã', atilde: 'ã',
  Auml: 'Ä', auml: 'ä', Aring: 'Å', aring: 'å',
  AElig: 'Æ', aelig: 'æ', Ccedil: 'Ç', ccedil: 'ç',
  Eacute: 'É', eacute: 'é', Egrave: 'È', egrave: 'è',
  Ecirc: 'Ê', ecirc: 'ê', Euml: 'Ë', euml: 'ë',
  Iacute: 'Í', iacute: 'í', Igrave: 'Ì', igrave: 'ì',
  Icirc: 'Î', icirc: 'î', Iuml: 'Ï', iuml: 'ï',
  Ntilde: 'Ñ', ntilde: 'ñ', Oacute: 'Ó', oacute: 'ó',
  Ograve: 'Ò', ograve: 'ò', Ocirc: 'Ô', ocirc: 'ô',
  Otilde: 'Õ', otilde: 'õ', Ouml: 'Ö', ouml: 'ö',
  Oslash: 'Ø', oslash: 'ø', Uacute: 'Ú', uacute: 'ú',
  Ugrave: 'Ù', ugrave: 'ù', Ucirc: 'Û', ucirc: 'û',
  Uuml: 'Ü', uuml: 'ü', Yacute: 'Ý', yacute: 'ý',
  yuml: 'ÿ', szlig: 'ß', THORN: 'Þ', thorn: 'þ',
  ETH: 'Ð', eth: 'ð', iexcl: '¡', iquest: '¿',
});

function decodeEntities(value) {
  const named = HTML_NAMED_ENTITIES;
  return String(value)
    .replace(/&#(\d+);?/g, (_, number) => {
      const point = Number(number);
      return Number.isInteger(point) && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : '';
    })
    .replace(/&#x([0-9a-f]+);?/gi, (_, number) => {
      const point = Number.parseInt(number, 16);
      return Number.isInteger(point) && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : '';
    })
    // Exact case first: HTML entity names are case-sensitive, and `&Prime;`,
    // `&Dagger;` and every Latin-1 capital differ from their lower-case twin
    // by nothing else. The lower-case fallback keeps `&AMP;`-style shouting
    // working, which is what the table did before it had any capitals in it.
    .replace(/&([a-z]+);/gi, (match, name) => named[name] ?? named[name.toLowerCase()] ?? match);
}

function stripCueMarkup(value) {
  return cleanInlineText(
    decodeEntities(
      String(value)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?[^>]+>/g, '')
    )
  );
}

function extractSpeakerPrefix(value) {
  const source = String(value).trim();
  const voice = source.match(/^<v(?:\.[^ >]+)?\s+([^>]{1,80})>([\s\S]*)$/i);
  if (voice) {
    return {
      speaker: cleanInlineText(voice[1], 100),
      text: stripCueMarkup(voice[2])
    };
  }

  const prefixed = source.match(/^(?:[-–—]\s*)?([\p{L}\p{N}][^:\n]{0,60}):\s+([\s\S]+)$/u);
  if (prefixed) {
    const candidate = cleanInlineText(prefixed[1], 100);
    const wordCount = countWords(candidate);
    if (wordCount <= 6 && !/[.!?]/.test(candidate)) {
      return { speaker: candidate, text: stripCueMarkup(prefixed[2]) };
    }
  }
  return { speaker: null, text: stripCueMarkup(source) };
}

function lineNumberAt(text, offset) {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (text.charCodeAt(index) === 10) line += 1;
  }
  return line;
}

function blockRanges(text) {
  const blocks = [];
  const pattern = /(?:^|\n{2,})([^\n][\s\S]*?)(?=\n{2,}|$)/g;
  let match;
  while ((match = pattern.exec(text))) {
    const content = match[1];
    const start = match.index + match[0].indexOf(content);
    blocks.push({ content, start, end: start + content.length });
  }
  return blocks;
}

function parseCueTranscript(text, format) {
  const input = normalizeLineEndings(text);
  const warnings = [];
  const segments = [];
  const blocks = blockRanges(input);

  blocks.forEach((block, blockIndex) => {
    const rawLines = block.content.split('\n');
    const trimmedLines = rawLines.map((line) => line.trim());
    if (format === 'vtt' && blockIndex === 0 && /^WEBVTT(?:\s|$)/i.test(trimmedLines[0] || '')) {
      const remaining = rawLines.slice(1).join('\n').trim();
      if (!remaining) return;
    }
    if (format === 'vtt' && /^(NOTE|STYLE|REGION)(?:\s|$)/i.test(trimmedLines[0] || '')) return;

    const timingIndex = trimmedLines.findIndex((line) => line.includes('-->'));
    if (timingIndex < 0) {
      if (format === 'srt' && block.content.trim()) {
        warnings.push(warning(
          'SUBTITLE_BLOCK_SKIPPED',
          `Subtitle block ${blockIndex + 1} had no readable timestamp and was skipped.`
        ));
      }
      return;
    }

    const timing = trimmedLines[timingIndex].match(
      /^(\d{1,3}:\d{2}(?::\d{2})?[,.]\d{1,3})\s*-->\s*(\d{1,3}:\d{2}(?::\d{2})?[,.]\d{1,3})/
    );
    if (!timing) {
      warnings.push(warning(
        'INVALID_SUBTITLE_TIMESTAMP',
        `Subtitle block ${blockIndex + 1} had an invalid timestamp and was skipped.`
      ));
      return;
    }

    const startMs = parseTimestamp(timing[1]);
    const endMs = parseTimestamp(timing[2]);
    if (startMs == null || endMs == null || endMs < startMs) {
      warnings.push(warning(
        'INVALID_SUBTITLE_RANGE',
        `Subtitle block ${blockIndex + 1} had an invalid time range and was skipped.`
      ));
      return;
    }

    const cueRaw = rawLines.slice(timingIndex + 1).join('\n').trim();
    const parsed = extractSpeakerPrefix(cueRaw);
    if (!parsed.text) return;
    segments.push({
      text: parsed.text,
      speaker: parsed.speaker,
      startMs,
      endMs,
      original: {
        source: 'normalized-decoded-input',
        startOffset: block.start,
        endOffset: block.end,
        lineStart: lineNumberAt(input, block.start),
        lineEnd: lineNumberAt(input, block.end),
        cue: blockIndex + 1
      }
    });
  });

  if (!segments.length) {
    throw new LabIntakeError(
      'NO_SUBTITLE_CUES',
      `No valid ${format.toUpperCase()} subtitle cues were found. Check the timestamps and cue formatting.`,
      { format }
    );
  }

  return { segments, warnings, boundarySpace: 'normalized-decoded-input' };
}

export function parseSrt(text) {
  return parseCueTranscript(text, 'srt');
}

export function parseVtt(text) {
  return parseCueTranscript(text, 'vtt');
}

function paragraphSegments(text) {
  const input = normalizeLineEndings(text);
  const paragraphs = blockRanges(input);
  const segments = [];

  for (const paragraph of paragraphs) {
    const raw = paragraph.content.trim();
    if (!raw) continue;
    const relativeStart = paragraph.content.indexOf(raw);
    const absoluteStart = paragraph.start + Math.max(0, relativeStart);

    if (raw.length <= INTAKE_LIMITS.maxSegmentCharacters) {
      segments.push({
        text: cleanInlineText(raw),
        original: {
          source: 'normalized-decoded-input',
          startOffset: absoluteStart,
          endOffset: absoluteStart + raw.length,
          lineStart: lineNumberAt(input, absoluteStart),
          lineEnd: lineNumberAt(input, absoluteStart + raw.length)
        }
      });
      continue;
    }

    let cursor = 0;
    while (cursor < raw.length) {
      let end = Math.min(cursor + INTAKE_LIMITS.maxSegmentCharacters, raw.length);
      if (end < raw.length) {
        const breakAt = raw.lastIndexOf(' ', end);
        if (breakAt > cursor + INTAKE_LIMITS.maxSegmentCharacters * 0.7) end = breakAt;
      }
      const chunk = raw.slice(cursor, end).trim();
      if (chunk) {
        const chunkStart = absoluteStart + cursor + raw.slice(cursor, end).indexOf(chunk);
        segments.push({
          text: cleanInlineText(chunk),
          original: {
            source: 'normalized-decoded-input',
            startOffset: chunkStart,
            endOffset: chunkStart + chunk.length,
            lineStart: lineNumberAt(input, chunkStart),
            lineEnd: lineNumberAt(input, chunkStart + chunk.length)
          }
        });
      }
      cursor = end;
      while (raw[cursor] === ' ') cursor += 1;
    }
  }
  return segments;
}

export function parsePlainText(text) {
  const input = normalizeLineEndings(text);
  const nonEmptyLines = [];
  let cursor = 0;
  for (const line of input.split('\n')) {
    const trimmed = line.trim();
    const start = cursor + line.indexOf(trimmed);
    if (trimmed) nonEmptyLines.push({ raw: trimmed, start, end: start + trimmed.length });
    cursor += line.length + 1;
  }

  const transcriptLines = nonEmptyLines.map((line) => {
    const timestampMatch = line.raw.match(
      /^\[?(\d{1,3}:\d{2}(?::\d{2})?(?:[,.]\d{1,3})?)\]?\s*(?:[-–—]\s*)?([\p{L}\p{N}][^:\n]{0,60}):\s+(.+)$/u
    );
    if (timestampMatch) {
      return {
        ...line,
        timestamp: timestampMatch[1],
        speaker: cleanInlineText(timestampMatch[2], 100),
        text: cleanInlineText(timestampMatch[3])
      };
    }
    const parsed = extractSpeakerPrefix(line.raw);
    return parsed.speaker
      ? { ...line, timestamp: null, ...parsed }
      : null;
  });

  const matchedLines = transcriptLines.filter(Boolean);
  const distinctSpeakers = new Set(matchedLines.map((line) => line.speaker.toLowerCase()));
  const appearsTranscriptLike = matchedLines.length >= 2
    && (matchedLines.some((line) => line.timestamp) || distinctSpeakers.size >= 2)
    && matchedLines.length / Math.max(1, nonEmptyLines.length) >= 0.6;

  if (!appearsTranscriptLike) {
    return {
      segments: paragraphSegments(input),
      warnings: [],
      boundarySpace: 'normalized-decoded-input'
    };
  }

  const segments = matchedLines.map((line, index) => {
    const startMs = parseTimestamp(line.timestamp);
    let endMs = null;
    const next = matchedLines[index + 1];
    if (next?.timestamp) endMs = parseTimestamp(next.timestamp);
    return {
      text: line.text,
      speaker: line.speaker,
      startMs,
      endMs,
      original: {
        source: 'normalized-decoded-input',
        startOffset: line.start,
        endOffset: line.end,
        lineStart: lineNumberAt(input, line.start),
        lineEnd: lineNumberAt(input, line.end)
      }
    };
  });
  return { segments, warnings: [], boundarySpace: 'normalized-decoded-input' };
}

function findField(record, names) {
  if (!record || typeof record !== 'object') return { key: null, value: null };
  const entries = Object.entries(record);
  for (const name of names) {
    const match = entries.find(([key]) => key.toLowerCase().replace(/[\s-]+/g, '_') === name);
    if (match) return { key: match[0], value: match[1] };
  }
  return { key: null, value: null };
}

function textFromJsonRecord(record) {
  if (typeof record === 'string') return record;
  if (!record || typeof record !== 'object') return '';
  const direct = findField(record, TEXT_FIELD_NAMES).value;
  if (typeof direct === 'string' || typeof direct === 'number') return String(direct);
  const alternative = record.alternatives?.[0];
  if (alternative && typeof alternative.transcript === 'string') return alternative.transcript;
  if (Array.isArray(record.words)) {
    return record.words
      .map((word) => typeof word === 'string' ? word : word?.word || word?.text || '')
      .filter(Boolean)
      .join(' ');
  }
  return '';
}

function selectJsonRecords(root) {
  if (Array.isArray(root)) return root;
  if (!root || typeof root !== 'object') return null;

  for (const key of ['segments', 'utterances', 'cues', 'items', 'entries', 'captions', 'words']) {
    if (Array.isArray(root[key])) return root[key];
  }
  if (Array.isArray(root.results)) {
    const alternatives = root.results.map((result) => {
      if (result?.alternatives?.[0]) return result.alternatives[0];
      return result;
    });
    if (alternatives.some((item) => textFromJsonRecord(item))) return alternatives;
  }
  if (root.transcript && typeof root.transcript === 'object') {
    return selectJsonRecords(root.transcript);
  }
  return null;
}

export function parseJsonTranscript(text) {
  const input = normalizeLineEndings(text);
  let root;
  try {
    root = JSON.parse(input);
  } catch (error) {
    const jsonLines = input.split('\n').map((line) => line.trim()).filter(Boolean);
    if (jsonLines.length > 1) {
      try {
        root = jsonLines.map((line, index) => {
          try {
            return JSON.parse(line);
          } catch (lineError) {
            throw new Error(`line ${index + 1}: ${lineError.message}`);
          }
        });
      } catch (lineError) {
        throw new LabIntakeError(
          'INVALID_JSON',
          `The JSON transcript could not be parsed (${lineError.message}).`,
          { cause: error.message }
        );
      }
    } else {
      throw new LabIntakeError(
        'INVALID_JSON',
        `The JSON transcript could not be parsed: ${error.message}`,
        { cause: error.message }
      );
    }
  }

  if (typeof root === 'string') return parsePlainText(root);
  if (typeof root?.transcript === 'string') return parsePlainText(root.transcript);
  if (typeof root?.text === 'string' && !Array.isArray(root.segments)) return parsePlainText(root.text);

  const records = selectJsonRecords(root);
  if (!records) {
    throw new LabIntakeError(
      'UNSUPPORTED_JSON_SHAPE',
      'The JSON is valid, but no transcript array or transcript text field was found. Expected segments, utterances, cues, items, results, transcript, or text.'
    );
  }

  const warnings = [];
  const segments = [];
  let extractedOffset = 0;
  records.forEach((record, recordIndex) => {
    const textValue = cleanInlineText(textFromJsonRecord(record));
    if (!textValue) return;
    const speakerField = findField(record, SPEAKER_FIELD_NAMES);
    const startField = findField(record, START_FIELD_NAMES);
    const endField = findField(record, END_FIELD_NAMES);
    const durationField = findField(record, DURATION_FIELD_NAMES);
    const startMs = parseFlexibleTime(startField.value, startField.key || '');
    let endMs = parseFlexibleTime(endField.value, endField.key || '');
    if (endMs == null && startMs != null && durationField.value != null) {
      const durationMs = parseFlexibleTime(durationField.value, durationField.key || '');
      if (durationMs != null) endMs = startMs + durationMs;
    }
    if (endMs != null && startMs != null && endMs < startMs) {
      warnings.push(warning(
        'JSON_TIME_RANGE_IGNORED',
        `JSON record ${recordIndex + 1} ended before it started; its end timestamp was ignored.`
      ));
      endMs = null;
    }
    segments.push({
      text: textValue,
      speaker: cleanInlineText(speakerField.value, 100) || null,
      startMs,
      endMs,
      original: {
        source: 'extracted-text',
        startOffset: extractedOffset,
        endOffset: extractedOffset + textValue.length,
        record: recordIndex + 1
      }
    });
    extractedOffset += textValue.length + 2;
  });

  if (!segments.length) {
    throw new LabIntakeError(
      'EMPTY_JSON_TRANSCRIPT',
      'The JSON structure was recognized, but none of its records contained analyzable transcript text.'
    );
  }
  if (segments.length < records.length) {
    warnings.push(warning(
      'JSON_RECORDS_SKIPPED',
      `${records.length - segments.length} JSON record(s) without text were skipped.`,
      'info'
    ));
  }
  return { segments, warnings, boundarySpace: 'extracted-text' };
}

function countDelimiter(line, delimiter) {
  let count = 0;
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') quoted = !quoted;
    else if (line[index] === delimiter && !quoted) count += 1;
  }
  return count;
}

function parseDelimitedRows(input, delimiter) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  let rowStart = 0;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      if (cell.trim()) {
        throw new LabIntakeError(
          'INVALID_CSV',
          `Unexpected quote in CSV row ${rows.length + 1}.`
        );
      }
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push({ cells: row, start: rowStart, end: index });
      row = [];
      cell = '';
      rowStart = index + 1;
    } else {
      cell += char;
    }
  }
  if (quoted) {
    throw new LabIntakeError(
      'INVALID_CSV',
      'The CSV transcript has an unclosed quoted field. Close the quote and try again.'
    );
  }
  row.push(cell);
  if (row.some((value) => value.length) || rows.length === 0) {
    rows.push({ cells: row, start: rowStart, end: input.length });
  }
  return rows;
}

function normalizedHeader(value) {
  return cleanInlineText(value, 100).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function findHeaderIndex(headers, names) {
  return headers.findIndex((header) => names.includes(header));
}

export function parseCsvTranscript(text) {
  const input = normalizeLineEndings(text);
  const firstLine = input.split('\n').find((line) => line.trim()) || '';
  const delimiters = [',', '\t', ';'];
  const delimiter = delimiters
    .map((candidate) => ({ candidate, count: countDelimiter(firstLine, candidate) }))
    .sort((a, b) => b.count - a.count)[0];
  if (!delimiter || delimiter.count === 0) {
    throw new LabIntakeError(
      'INVALID_CSV',
      'No CSV delimiter was detected. Include a header row and comma-, tab-, or semicolon-separated fields.'
    );
  }

  const rows = parseDelimitedRows(input, delimiter.candidate)
    .filter((row) => row.cells.some((cell) => cell.trim()));
  if (rows.length < 2) {
    throw new LabIntakeError(
      'EMPTY_CSV_TRANSCRIPT',
      'The CSV needs a header and at least one transcript row.'
    );
  }

  const headers = rows[0].cells.map(normalizedHeader);
  let textIndex = findHeaderIndex(headers, TEXT_FIELD_NAMES);
  let speakerIndex = findHeaderIndex(headers, SPEAKER_FIELD_NAMES);
  let startIndex = findHeaderIndex(headers, START_FIELD_NAMES);
  let endIndex = findHeaderIndex(headers, END_FIELD_NAMES);
  const warnings = [];
  let dataRows = rows.slice(1);

  if (textIndex < 0) {
    const headerLooksLikeData = rows[0].cells.some((cell) =>
      parseTimestamp(cell) != null || countWords(cell) > 3
    );
    if (!headerLooksLikeData) {
      throw new LabIntakeError(
        'CSV_TEXT_COLUMN_MISSING',
        'No transcript text column was found. Name it text, transcript, content, utterance, caption, sentence, or line.'
      );
    }
    dataRows = rows;
    textIndex = Math.max(0, rows[0].cells.length - 1);
    startIndex = rows[0].cells.findIndex((cell) => parseTimestamp(cell) != null);
    speakerIndex = startIndex === 1 ? 0 : -1;
    endIndex = -1;
    warnings.push(warning(
      'CSV_COLUMNS_INFERRED',
      'The CSV had no recognized header, so the Lab inferred the final column as transcript text.',
      'info'
    ));
  }

  const segments = [];
  dataRows.forEach((row, rowIndex) => {
    const textValue = cleanInlineText(row.cells[textIndex]);
    if (!textValue) return;
    const startMs = parseTimestamp(row.cells[startIndex]);
    let endMs = parseTimestamp(row.cells[endIndex]);
    if (startMs != null && endMs != null && endMs < startMs) {
      endMs = null;
      warnings.push(warning(
        'CSV_TIME_RANGE_IGNORED',
        `CSV row ${rowIndex + (dataRows === rows ? 1 : 2)} ended before it started; its end timestamp was ignored.`
      ));
    }
    segments.push({
      text: textValue,
      speaker: cleanInlineText(row.cells[speakerIndex], 100) || null,
      startMs,
      endMs,
      original: {
        source: 'normalized-decoded-input',
        startOffset: row.start,
        endOffset: row.end,
        row: rowIndex + (dataRows === rows ? 1 : 2)
      }
    });
  });

  if (!segments.length) {
    throw new LabIntakeError(
      'EMPTY_CSV_TRANSCRIPT',
      'The CSV was parsed, but its transcript text column contained no analyzable text.'
    );
  }
  return { segments, warnings, boundarySpace: 'normalized-decoded-input' };
}

function htmlToTextFallback(html) {
  let source = String(html);
  const preferred = source.match(/<(article|main)\b[^>]*>([\s\S]*?)<\/\1\s*>/i);
  if (preferred) source = preferred[2];
  const dangerous = /<(script|style|template|noscript|iframe|object|svg|nav|footer|aside|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
  const blocks = new RegExp(`</?(?:${BLOCK_TAGS.join('|')})\\b[^>]*>`, 'gi');
  return decodeEntities(
    source
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(dangerous, ' ')
      .replace(blocks, '\n')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function htmlToTextWithDom(html) {
  if (typeof DOMParser === 'undefined') return null;
  const parsed = new DOMParser().parseFromString(String(html), 'text/html');
  parsed.querySelectorAll(
    'script, style, template, noscript, iframe, object, svg, canvas, nav, footer, aside, form'
  ).forEach((element) => element.remove());
  const preferred = parsed.querySelector('article, main, [role="main"]') || parsed.body;
  if (!preferred) return '';

  const output = [];
  const walk = (node) => {
    if (node.nodeType === 3) {
      output.push(node.nodeValue || '');
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (BLOCK_TAGS.includes(tag)) output.push('\n');
    node.childNodes.forEach(walk);
    if (BLOCK_TAGS.includes(tag)) output.push('\n');
  };
  walk(preferred);
  return output.join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractTextFromHtml(html) {
  const input = normalizeLineEndings(html);
  const extracted = htmlToTextWithDom(input) ?? htmlToTextFallback(input);
  return cleanControlCharacters(extracted).trim();
}

export function parseHtmlDocument(html) {
  const extracted = extractTextFromHtml(html);
  if (!extracted) {
    throw new LabIntakeError(
      'EMPTY_HTML_DOCUMENT',
      'No readable article or document text was found in the HTML.'
    );
  }
  const parsed = parsePlainText(extracted);
  parsed.segments.forEach((segment) => {
    segment.original.source = 'extracted-text';
  });
  parsed.boundarySpace = 'extracted-text';
  parsed.warnings.push(warning(
    'HTML_READABLE_TEXT',
    'Scripts, styles, navigation, forms, and embedded objects were removed before analysis.',
    'info'
  ));
  return parsed;
}

export function extractTextFromRtf(rtf) {
  return normalizeLineEndings(rtf)
    .replace(/\\'[0-9a-f]{2}/gi, (match) => {
      const code = Number.parseInt(match.slice(2), 16);
      return String.fromCharCode(code);
    })
    .replace(/\\u(-?\d+)\??/g, (_, value) => {
      const code = Number(value);
      return String.fromCharCode(code < 0 ? code + 65_536 : code);
    })
    .replace(/\\(?:par|line)\b/g, '\n')
    .replace(/\\tab\b/g, '\t')
    .replace(/\\[a-z]+-?\d* ?/gi, '')
    .replace(/\\[{}\\]/g, (match) => match.slice(1))
    .replace(/[{}]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function parseRtfDocument(rtf) {
  const extracted = extractTextFromRtf(rtf);
  if (!extracted) {
    throw new LabIntakeError('EMPTY_RTF_DOCUMENT', 'No readable text was recovered from the RTF file.');
  }
  const parsed = parsePlainText(extracted);
  parsed.segments.forEach((segment) => {
    segment.original.source = 'extracted-text';
  });
  parsed.boundarySpace = 'extracted-text';
  parsed.warnings.push(warning(
    'RTF_BASIC_EXTRACTION',
    'RTF formatting was discarded by the browser-side basic text extractor. Review the source view for extraction errors.',
    'info'
  ));
  return parsed;
}

function normalizeSource(source = {}) {
  const url = source.url ? canonicalizeUrl(source.url) : null;
  const normalized = {
    title: cleanSourceTitle(source.title, source.fileName || 'Untitled source'),
    type: cleanInlineText(source.type || 'pasted-text', 80) || 'pasted-text',
    url,
    fileName: source.fileName ? cleanSourceTitle(source.fileName, '') : null,
    mimeType: source.mimeType ? cleanInlineText(source.mimeType, 160) : null
  };
  if (source.media && typeof source.media === 'object') {
    normalized.media = {
      mediaType: ['audio', 'video'].includes(source.media.mediaType)
        ? source.media.mediaType
        : null,
      fileName: source.media.fileName ? cleanSourceTitle(source.media.fileName, '') : null,
      mimeType: source.media.mimeType ? cleanInlineText(source.media.mimeType, 160) : null,
      sizeBytes: Number.isFinite(source.media.sizeBytes) ? source.media.sizeBytes : null,
      durationMs: Number.isFinite(source.media.durationMs) ? source.media.durationMs : null,
      width: Number.isFinite(source.media.width) ? source.media.width : null,
      height: Number.isFinite(source.media.height) ? source.media.height : null,
      companionFileName: source.media.companionFileName
        ? cleanSourceTitle(source.media.companionFileName, '')
        : null
    };
  }
  return normalized;
}

function normalizeOriginal(original, fallbackStart, fallbackEnd) {
  const startOffset = Number.isInteger(original?.startOffset)
    ? Math.max(0, original.startOffset)
    : fallbackStart;
  const endOffset = Number.isInteger(original?.endOffset)
    ? Math.max(startOffset, original.endOffset)
    : Math.max(startOffset, fallbackEnd);
  const normalized = {
    source: ['normalized-decoded-input', 'extracted-text'].includes(original?.source)
      ? original.source
      : 'extracted-text',
    startOffset,
    endOffset
  };
  for (const field of ['lineStart', 'lineEnd', 'cue', 'record', 'row', 'page']) {
    if (Number.isInteger(original?.[field])) normalized[field] = original[field];
  }
  return normalized;
}

export function createNormalizedDocument({
  source = {},
  segments = [],
  extraction = {},
  text = null,
  createdAt = new Date().toISOString()
} = {}) {
  if (!Array.isArray(segments)) {
    throw new LabIntakeError('INVALID_SEGMENTS', 'Normalized document segments must be an array.');
  }
  if (segments.length > INTAKE_LIMITS.maxSegments) {
    throw new LabIntakeError(
      'SEGMENT_LIMIT_EXCEEDED',
      `This source contains ${segments.length.toLocaleString()} segments. The browser limit is ${INTAKE_LIMITS.maxSegments.toLocaleString()}; split the transcript into smaller parts.`,
      { actual: segments.length, limit: INTAKE_LIMITS.maxSegments }
    );
  }

  const normalizedSegments = [];
  let extractedOffset = 0;
  segments.forEach((segment) => {
    const segmentText = cleanInlineText(
      typeof segment === 'string' ? segment : segment?.text,
      INTAKE_LIMITS.maxSegmentCharacters + 1
    );
    if (segmentText.length > INTAKE_LIMITS.maxSegmentCharacters) {
      throw new LabIntakeError(
        'SEGMENT_CHARACTER_LIMIT_EXCEEDED',
        `Segment ${normalizedSegments.length + 1} exceeds ${INTAKE_LIMITS.maxSegmentCharacters.toLocaleString()} characters. Split that cue or record before analysis.`,
        { segment: normalizedSegments.length + 1, limit: INTAKE_LIMITS.maxSegmentCharacters }
      );
    }
    if (!segmentText) return;
    const order = normalizedSegments.length;
    const speaker = cleanInlineText(segment?.speaker, 100) || null;
    const startMs = Number.isFinite(segment?.startMs) ? Math.max(0, Math.round(segment.startMs)) : null;
    let endMs = Number.isFinite(segment?.endMs) ? Math.max(0, Math.round(segment.endMs)) : null;
    if (startMs != null && endMs != null && endMs < startMs) endMs = null;
    const original = normalizeOriginal(
      segment?.original,
      extractedOffset,
      extractedOffset + segmentText.length
    );
    const idHash = stableHash(
      `${order}|${speaker || ''}|${startMs ?? ''}|${endMs ?? ''}|${segmentText}`
    );
    normalizedSegments.push({
      id: `seg-${String(order + 1).padStart(5, '0')}-${idHash}`,
      order,
      speaker,
      startMs,
      endMs,
      text: segmentText,
      original
    });
    extractedOffset += segmentText.length + 2;
  });

  if (!normalizedSegments.length) {
    throw new LabIntakeError(
      'EMPTY_DOCUMENT',
      'No analyzable text was found. Paste text or attach a transcript/subtitle file before analyzing.'
    );
  }

  const combinedText = text == null
    ? normalizedSegments.map((segment) => segment.text).join('\n\n')
    : normalizeLineEndings(text).trim();
  if (combinedText.length > INTAKE_LIMITS.maxDocumentCharacters) {
    throw new LabIntakeError(
      'CHARACTER_LIMIT_EXCEEDED',
      `This source has ${combinedText.length.toLocaleString()} characters. The browser limit is ${INTAKE_LIMITS.maxDocumentCharacters.toLocaleString()}; split the transcript into smaller parts.`,
      { actual: combinedText.length, limit: INTAKE_LIMITS.maxDocumentCharacters }
    );
  }

  const normalizedSource = normalizeSource(source);
  const speakers = [...new Set(normalizedSegments.map((segment) => segment.speaker).filter(Boolean))];
  const timedSegments = normalizedSegments.filter((segment) => segment.startMs != null);
  const durationMs = normalizedSegments.reduce(
    (maximum, segment) => Math.max(maximum, segment.endMs ?? segment.startMs ?? 0),
    0
  ) || null;
  const extractionMethod = cleanInlineText(extraction.method || 'direct-text', 120) || 'direct-text';
  const boundarySpace = ['normalized-decoded-input', 'extracted-text'].includes(extraction.boundarySpace)
    ? extraction.boundarySpace
    : 'normalized-decoded-input';
  const confidence = Number.isFinite(extraction.confidence)
    ? Math.max(0, Math.min(100, Number(extraction.confidence)))
    : null;
  const documentFingerprint = stableHash(
    `${normalizedSource.title}|${normalizedSource.url || ''}|${normalizedSegments.map((segment) => segment.id).join('|')}`
  );

  return {
    schema: NORMALIZED_DOCUMENT_SCHEMA,
    schemaVersion: NORMALIZED_DOCUMENT_SCHEMA_VERSION,
    id: `doc-${documentFingerprint}`,
    createdAt,
    source: normalizedSource,
    extraction: {
      method: extractionMethod,
      boundarySpace,
      confidence,
      warnings: normalizeWarnings(extraction.warnings)
    },
    speakers,
    segments: normalizedSegments,
    text: combinedText,
    stats: {
      characters: combinedText.length,
      words: countWords(combinedText),
      segments: normalizedSegments.length,
      timedSegments: timedSegments.length,
      durationMs
    }
  };
}

export function normalizeInput({
  text,
  format = 'auto',
  source = {},
  extraction = {},
  createdAt
} = {}) {
  const input = normalizeLineEndings(text);
  if (!input.trim()) {
    throw new LabIntakeError(
      'EMPTY_INPUT',
      'Paste text or choose a transcript file before analyzing.'
    );
  }
  if (input.length > INTAKE_LIMITS.maxDocumentCharacters) {
    throw new LabIntakeError(
      'CHARACTER_LIMIT_EXCEEDED',
      `This source has ${input.length.toLocaleString()} characters. The browser limit is ${INTAKE_LIMITS.maxDocumentCharacters.toLocaleString()}; split the transcript into smaller parts.`,
      { actual: input.length, limit: INTAKE_LIMITS.maxDocumentCharacters }
    );
  }

  const selectedFormat = format === 'auto'
    ? detectTextFormat({
      fileName: source.fileName,
      mimeType: source.mimeType,
      text: input
    })
    : String(format).toLowerCase();
  if (!TEXT_FORMATS.includes(selectedFormat)) {
    throw new LabIntakeError(
      'UNSUPPORTED_TEXT_FORMAT',
      `The text format "${selectedFormat}" is not supported.`,
      { format: selectedFormat }
    );
  }

  let parsed;
  if (selectedFormat === 'srt') parsed = parseSrt(input);
  else if (selectedFormat === 'vtt') parsed = parseVtt(input);
  else if (selectedFormat === 'json') parsed = parseJsonTranscript(input);
  else if (selectedFormat === 'csv') parsed = parseCsvTranscript(input);
  else if (selectedFormat === 'html') parsed = parseHtmlDocument(input);
  else if (selectedFormat === 'rtf') parsed = parseRtfDocument(input);
  else parsed = parsePlainText(input);

  return createNormalizedDocument({
    source: {
      ...source,
      type: source.type || (
        selectedFormat === 'text' ? 'pasted-text' : `${selectedFormat}-transcript`
      )
    },
    segments: parsed.segments,
    extraction: {
      method: extraction.method || (
        selectedFormat === 'text' ? 'direct-text' : `${selectedFormat}-parser`
      ),
      boundarySpace: extraction.boundarySpace || parsed.boundarySpace,
      confidence: extraction.confidence,
      warnings: [...(parsed.warnings || []), ...(extraction.warnings || [])]
    },
    text: ['srt', 'vtt', 'json', 'csv', 'html', 'rtf'].includes(selectedFormat)
      ? parsed.segments.map((segment) => segment.text).join('\n\n')
      : input.trim(),
    createdAt
  });
}

export function validateNormalizedDocument(document) {
  const errors = [];
  if (!document || typeof document !== 'object') {
    return { valid: false, errors: ['Document must be an object.'] };
  }
  if (document.schema !== NORMALIZED_DOCUMENT_SCHEMA) errors.push('Unknown normalized-document schema.');
  if (document.schemaVersion !== NORMALIZED_DOCUMENT_SCHEMA_VERSION) {
    errors.push(`Unsupported normalized-document schema version: ${document.schemaVersion || 'missing'}.`);
  }
  if (!document.source?.title) errors.push('Source title is required.');
  if (!Array.isArray(document.segments) || !document.segments.length) {
    errors.push('At least one segment is required.');
  } else {
    const ids = new Set();
    document.segments.forEach((segment, index) => {
      if (!segment.id) errors.push(`Segment ${index + 1} has no stable ID.`);
      else if (ids.has(segment.id)) errors.push(`Duplicate segment ID: ${segment.id}.`);
      else ids.add(segment.id);
      if (segment.order !== index) errors.push(`Segment ${segment.id || index + 1} has an invalid order.`);
      if (!segment.text?.trim()) errors.push(`Segment ${segment.id || index + 1} has no text.`);
      if (!Number.isInteger(segment.original?.startOffset) || !Number.isInteger(segment.original?.endOffset)) {
        errors.push(`Segment ${segment.id || index + 1} has invalid excerpt boundaries.`);
      } else if (segment.original.endOffset < segment.original.startOffset) {
        errors.push(`Segment ${segment.id || index + 1} has a reversed excerpt boundary.`);
      }
      if (
        segment.startMs != null
        && segment.endMs != null
        && segment.endMs < segment.startMs
      ) {
        errors.push(`Segment ${segment.id || index + 1} ends before it starts.`);
      }
    });
  }
  if (document.stats?.segments !== document.segments?.length) {
    errors.push('Segment count does not match document stats.');
  }
  return { valid: errors.length === 0, errors };
}

export function canonicalizeUrl(value) {
  const input = cleanControlCharacters(value).trim();
  if (!input) return null;
  if (input.length > INTAKE_LIMITS.maxUrlCharacters) {
    throw new LabIntakeError(
      'URL_LIMIT_EXCEEDED',
      `The source URL exceeds ${INTAKE_LIMITS.maxUrlCharacters.toLocaleString()} characters.`
    );
  }
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new LabIntakeError(
      'INVALID_SOURCE_URL',
      'Enter a complete source URL beginning with https:// or http://.'
    );
  }
  if (!['https:', 'http:'].includes(parsed.protocol)) {
    throw new LabIntakeError(
      'UNSAFE_SOURCE_URL',
      'Only http:// and https:// source URLs are accepted.'
    );
  }
  parsed.username = '';
  parsed.password = '';
  parsed.hash = '';
  return parsed.toString();
}

export function classifySourceUrl(value) {
  const url = canonicalizeUrl(value);
  if (!url) return { kind: 'none', url: null, canFetchText: false, requiresTranscript: true };
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const extension = extensionOf(parsed.pathname);
  const path = parsed.pathname.toLowerCase();

  if (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    return {
      kind: 'youtube',
      url,
      provider: 'YouTube',
      canFetchText: false,
      requiresTranscript: true,
      guidance: 'YouTube does not provide a reliable browser-side transcript endpoint. Paste or upload the transcript/subtitles and keep this URL as provenance.'
    };
  }
  if (
    host.endsWith('open.spotify.com')
    || host.endsWith('podcasts.apple.com')
    || host.endsWith('podbean.com')
    || host.endsWith('buzzsprout.com')
    || host.endsWith('transistor.fm')
  ) {
    return {
      kind: 'podcast',
      url,
      provider: host,
      canFetchText: false,
      requiresTranscript: true,
      guidance: 'Podcast pages rarely expose a CORS-readable transcript. Paste or upload a transcript and retain this URL as provenance.'
    };
  }
  if (VIDEO_EXTENSIONS.has(extension)) {
    return {
      kind: 'direct-video',
      url,
      canFetchText: false,
      requiresTranscript: true,
      guidance: 'The Lab can retain this video URL as provenance, but it needs transcript text to analyze.'
    };
  }
  if (AUDIO_EXTENSIONS.has(extension)) {
    return {
      kind: 'direct-audio',
      url,
      canFetchText: false,
      requiresTranscript: true,
      guidance: 'The Lab can retain this audio URL as provenance, but it needs transcript text to analyze.'
    };
  }
  if (
    ['xml', 'rss', 'atom'].includes(extension)
    || /(?:^|\/)(?:feed|rss|podcast)(?:\/|$)/.test(path)
  ) {
    return {
      kind: 'rss',
      url,
      canFetchText: true,
      requiresTranscript: false,
      guidance: 'The Lab can try a CORS-safe feed fetch. Episode audio still needs a companion transcript.'
    };
  }
  return {
    kind: 'article',
    url,
    canFetchText: true,
    requiresTranscript: false,
    guidance: 'The Lab can try a browser-side article fetch. The publisher must permit cross-origin access.'
  };
}

export function validSourceProvenanceUrl(value) {
  try {
    return classifySourceUrl(value).url;
  } catch {
    return null;
  }
}

export function assessSourceInputReadiness({
  text = '',
  normalizedDocument = null,
  sourceUrl = '',
  companionFile = null
} = {}) {
  const hasAnalyzableContent = Boolean(
    cleanControlCharacters(text).trim()
    || normalizedDocument
    || companionFile
  );
  const rawSourceUrl = cleanControlCharacters(sourceUrl).trim();
  let classification = null;
  let urlError = null;
  if (rawSourceUrl) {
    try {
      classification = classifySourceUrl(sourceUrl);
    } catch (error) {
      urlError = error;
    }
  }
  const retrievalEligible = Boolean(classification?.canFetchText);
  const provenanceUrl = classification?.url || null;
  const urlState = !rawSourceUrl
    ? 'empty'
    : urlError
      ? hasAnalyzableContent ? 'warning' : 'blocking-error'
      : 'valid';
  return {
    canAnalyze: Boolean(hasAnalyzableContent || retrievalEligible),
    hasAnalyzableContent,
    hasSuppliedText: hasAnalyzableContent,
    retrievalEligible,
    provenanceValid: Boolean(provenanceUrl),
    provenanceUrl,
    blockingUrlError: urlState === 'blocking-error' ? urlError : null,
    metadataUrlWarning: urlState === 'warning' ? urlError : null,
    urlState,
    classification,
    urlError
  };
}

export function applyOptionalSourceMetadata(documentValue, {
  title = '',
  sourceUrl = ''
} = {}) {
  if (!documentValue || typeof documentValue !== 'object') {
    throw new LabIntakeError(
      'INVALID_NORMALIZED_DOCUMENT',
      'A normalized document is required before source metadata can be applied.'
    );
  }
  const typedUrl = cleanControlCharacters(sourceUrl).trim();
  const provenanceCandidate = typedUrl || documentValue.source?.url;
  const provenanceUrl = validSourceProvenanceUrl(provenanceCandidate);
  return {
    ...documentValue,
    source: {
      ...documentValue.source,
      title: cleanControlCharacters(title).trim() || documentValue.source?.title,
      url: provenanceUrl
    }
  };
}

export function canAttemptSourceUrlExtraction(value) {
  return assessSourceInputReadiness({ sourceUrl: value }).retrievalEligible;
}
