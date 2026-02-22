import { supabase } from "@/integrations/supabase/client";

export interface Quote {
  id: string;
  raw_text: string;
  formatted_quote: QuoteLine[];
  speaker_count: number;
  character_names_array: string[];
  content_tag: string;
  relationship_tag: string;
  date_added: string;
}

export interface QuoteLine {
  speaker?: string;
  text: string;
  isNarrative?: boolean;
}

export interface Suggestion {
  id: string;
  raw_text: string;
  parsed_speakers: string[];
  speaker_count: number;
  content_tag: string | null;
  relationship_tag: string | null;
  date_submitted: string;
}

export function parseQuoteText(raw: string): { lines: QuoteLine[]; speakers: string[] } {
  const lines: QuoteLine[] = [];
  const speakers = new Set<string>();
  const rawLines = raw.split("\n").filter((l) => l.trim());

  for (const line of rawLines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const speaker = match[1].trim();
      const text = match[2].trim();
      speakers.add(speaker.toLowerCase());
      lines.push({ speaker, text });
    } else {
      lines.push({ text: line.trim(), isNarrative: true });
    }
  }

  return { lines, speakers: Array.from(speakers) };
}

export function replaceNames(text: string, nameMap: Map<string, string>): string {
  let result = text;
  for (const [placeholder, replacement] of nameMap) {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    result = result.replace(regex, replacement);
  }
  return result;
}

export function buildNameMap(userNames: string[]): Map<string, string> {
  const map = new Map<string, string>();
  const letters = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < userNames.length && i < 26; i++) {
    if (userNames[i].trim()) {
      map.set(`person ${letters[i]}`, userNames[i].trim());
    }
  }
  return map;
}

export async function fetchQuotes(filters: {
  speakerCount: string;
  content: string;
  relationship: string;
}): Promise<Quote[]> {
  let query = supabase.from("quotes").select("*");

  if (filters.speakerCount !== "any") {
    if (filters.speakerCount === "6+") {
      query = query.gte("speaker_count", 6);
    } else {
      query = query.eq("speaker_count", parseInt(filters.speakerCount));
    }
  }

  if (filters.content !== "Both SFW and NSFW") {
    query = query.eq("content_tag", filters.content);
  }

  if (filters.relationship !== "Both Shipping and Nonshipping") {
    query = query.eq("relationship_tag", filters.relationship);
  }

  const { data, error } = await query.order("date_added", { ascending: false });
  if (error) throw error;

  return (data || []).map((d: any) => ({
    ...d,
    formatted_quote: typeof d.formatted_quote === "string" ? JSON.parse(d.formatted_quote) : d.formatted_quote,
  }));
}

export async function fetchSuggestions(): Promise<Suggestion[]> {
  const { data, error } = await supabase
    .from("suggestions")
    .select("*")
    .order("date_submitted", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function submitSuggestion(raw_text: string, content_tag: string | null, relationship_tag: string | null) {
  const { lines, speakers } = parseQuoteText(raw_text);
  const { error } = await supabase.from("suggestions").insert({
    raw_text,
    parsed_speakers: Array.from(speakers),
    speaker_count: new Set(speakers).size || 1,
    content_tag: content_tag === "I'm not sure" ? null : content_tag,
    relationship_tag: relationship_tag === "I'm not sure" ? null : relationship_tag,
  });
  if (error) throw error;
}

export async function approveQuote(
  suggestion: Suggestion,
  contentTag: string,
  relationshipTag: string
) {
  const { lines, speakers } = parseQuoteText(suggestion.raw_text);
  const { error: insertError } = await supabase.from("quotes").insert({
    raw_text: suggestion.raw_text,
    formatted_quote: lines as any,
    speaker_count: suggestion.speaker_count,
    character_names_array: suggestion.parsed_speakers,
    content_tag: contentTag,
    relationship_tag: relationshipTag,
  } as any);
  if (insertError) throw insertError;

  const { error: deleteError } = await supabase
    .from("suggestions")
    .delete()
    .eq("id", suggestion.id);
  if (deleteError) throw deleteError;
}

export async function deleteSuggestion(id: string) {
  const { error } = await supabase.from("suggestions").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteQuote(id: string) {
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw error;
}

export async function addQuote(
  raw_text: string,
  contentTag: string,
  relationshipTag: string
) {
  const { lines, speakers } = parseQuoteText(raw_text);
  const { error } = await supabase.from("quotes").insert({
    raw_text,
    formatted_quote: lines as any,
    speaker_count: new Set(speakers).size || 1,
    character_names_array: Array.from(speakers),
    content_tag: contentTag,
    relationship_tag: relationshipTag,
  } as any);
  if (error) throw error;
}

export async function updateQuote(
  id: string,
  raw_text: string,
  contentTag: string,
  relationshipTag: string
) {
  const { lines, speakers } = parseQuoteText(raw_text);
  const { error } = await supabase
    .from("quotes")
    .update({
      raw_text,
      formatted_quote: lines as any,
      speaker_count: new Set(speakers).size || 1,
      character_names_array: Array.from(speakers),
      content_tag: contentTag,
      relationship_tag: relationshipTag,
    } as any)
    .eq("id", id);
  if (error) throw error;
}

export async function getQuoteCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("quotes").select("speaker_count");
  if (error) throw error;
  const counts: Record<string, number> = { any: 0 };
  for (const q of data || []) {
    counts.any++;
    const key = q.speaker_count >= 6 ? "6+" : String(q.speaker_count);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}
