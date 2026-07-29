import { normalizeInput } from './lab-intake.js?v=2.4.1';

/**
 * Original demonstration written for LE Lab. It is deliberately mixed:
 * several claims map cleanly, several collapse dating stages, and one statistic
 * is unsupported so the Research Queue has useful residue to surface.
 */
export const LAB_DEMO_TRANSCRIPT = `WEBVTT

00:00:02.000 --> 00:00:13.500
<v Maya>People say chemistry is everything, but attraction only gets you into the room. It does not tell you whether someone can build or keep a relationship.

00:00:14.000 --> 00:00:27.000
<v Jonah>Right. Selection, compatibility, and retention are different tests. A person can have plenty of options and still choose badly.

00:00:28.000 --> 00:00:42.000
<v Maya>Still, all women want the highest-status man available, and men never care about anything except looks. That is just biology.

00:00:43.000 --> 00:00:58.000
<v Jonah>Those are averages turned into absolutes. Context, age, goals, opportunity, and the actual people in the room can change the pattern.

00:01:00.000 --> 00:01:16.000
<v Maya>I saw a survey where 82 percent of couples who met online said shared music taste caused their relationship to last longer.

00:01:17.000 --> 00:01:31.000
<v Jonah>Did it show causation, or did compatible couples simply report more shared tastes? We would need the sample, comparison group, and retention measure.

00:01:33.000 --> 00:01:47.000
<v Maya>Suppose someone improves money, status, looks, charm, and exposure, gets more dates, then expects a particular person to say yes.

00:01:48.000 --> 00:02:02.000
<v Jonah>More leverage can change opportunity. It does not create entitlement, override consent, or make market value the same thing as moral worth.

00:02:04.000 --> 00:02:18.000
<v Maya>Here is the edge case: what if the strategy wins attention but repeatedly selects partners whose life plans make long-term compatibility impossible?

00:02:19.000 --> 00:02:31.000
<v Jonah>Then the rule survives only as an attraction or selection rule. It fails if someone quietly promotes it into a universal relationship law.`;

export const LAB_DEMO_SOURCE = Object.freeze({
  title: 'Chemistry, leverage, and the stages people collapse',
  type: 'built-in-demonstration',
  url: null
});

export function createDemoDocument(options = {}) {
  return normalizeInput({
    text: LAB_DEMO_TRANSCRIPT,
    format: 'vtt',
    source: { ...LAB_DEMO_SOURCE, ...(options.source || {}) },
    extraction: {
      method: 'built-in-demo',
      warnings: [{
        code: 'DEMONSTRATION_SOURCE',
        message: 'This is an original LE Lab demonstration, not a quotation from a real show.',
        severity: 'info'
      }]
    },
    createdAt: options.createdAt
  });
}
