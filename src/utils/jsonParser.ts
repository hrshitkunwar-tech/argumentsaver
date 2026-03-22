/**
 * Safe JSON extraction for Grok responses.
 *
 * Grok sometimes wraps JSON in markdown code fences (```json ... ```) or
 * adds a preamble. This utility strips all that and returns the parsed object
 * or throws a typed error.
 */

export class GrokParseError extends Error {
  constructor(
    message: string,
    public readonly raw: string
  ) {
    super(message);
    this.name = 'GrokParseError';
  }
}

export interface RewritePayload {
  primary: string;
  alternates: [string, string];
}

/**
 * Extracts and validates the rewrite JSON from a Grok completion string.
 * Handles: plain JSON, markdown code fences, leading/trailing whitespace.
 */
export function parseRewritePayload(raw: string): RewritePayload {
  // Strip markdown code fences if present
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  // Find first { ... } block in case Grok added commentary
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new GrokParseError('No JSON object found in response', raw);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new GrokParseError(
      `JSON.parse failed: ${(e as Error).message}`,
      raw
    );
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('primary' in parsed) ||
    !('alternates' in parsed)
  ) {
    throw new GrokParseError('Missing required fields: primary, alternates', raw);
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.primary !== 'string' || !obj.primary.trim()) {
    throw new GrokParseError('primary must be a non-empty string', raw);
  }

  if (
    !Array.isArray(obj.alternates) ||
    obj.alternates.length < 2 ||
    !obj.alternates.every((a) => typeof a === 'string')
  ) {
    throw new GrokParseError('alternates must be an array of 2+ strings', raw);
  }

  return {
    primary: obj.primary.trim(),
    alternates: [
      (obj.alternates[0] as string).trim(),
      (obj.alternates[1] as string).trim(),
    ],
  };
}
