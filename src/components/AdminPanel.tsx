import { useState, useEffect, useCallback } from "react";
import {
  type Suggestion,
  type Quote,
  fetchSuggestions,
  fetchQuotes,
  approveQuote,
  deleteSuggestion,
  deleteQuote,
  addQuote,
  updateQuote,
} from "@/lib/quotes";

export default function AdminPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [approving, setApproving] = useState<string | null>(null);
  const [approveContent, setApproveContent] = useState("Both");
  const [approveRelationship, setApproveRelationship] = useState("Both");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editContent, setEditContent] = useState("Both");
  const [editRelationship, setEditRelationship] = useState("Both");
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newContent, setNewContent] = useState("Both");
  const [newRelationship, setNewRelationship] = useState("Both");

  // Filters
  const [sugSpeakerFilter, setSugSpeakerFilter] = useState("all");
  const [sugSortBy, setSugSortBy] = useState<"speakers" | "date">("date");
  const [sugSortAsc, setSugSortAsc] = useState(false);

  const [quoteSpeakerFilter, setQuoteSpeakerFilter] = useState("all");
  const [quoteContentFilter, setQuoteContentFilter] = useState("all");
  const [quoteRelFilter, setQuoteRelFilter] = useState("all");
  const [quoteSortBy, setQuoteSortBy] = useState<"speakers" | "date">("date");
  const [quoteSortAsc, setQuoteSortAsc] = useState(false);

  const load = useCallback(async () => {
    const [s, q] = await Promise.all([fetchSuggestions(), fetchQuotes({ speakerCount: "any", content: "Both SFW and NSFW", relationship: "Both Shipping and Nonshipping" })]);
    setSuggestions(s);
    setQuotes(q);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredSuggestions = suggestions
    .filter((s) => sugSpeakerFilter === "all" || (sugSpeakerFilter === "6+" ? s.speaker_count >= 6 : s.speaker_count === parseInt(sugSpeakerFilter)))
    .sort((a, b) => {
      if (sugSortBy === "speakers") return sugSortAsc ? a.speaker_count - b.speaker_count : b.speaker_count - a.speaker_count;
      return sugSortAsc ? new Date(a.date_submitted).getTime() - new Date(b.date_submitted).getTime() : new Date(b.date_submitted).getTime() - new Date(a.date_submitted).getTime();
    });

  const filteredQuotes = quotes
    .filter((q) => quoteSpeakerFilter === "all" || (quoteSpeakerFilter === "6+" ? q.speaker_count >= 6 : q.speaker_count === parseInt(quoteSpeakerFilter)))
    .filter((q) => quoteContentFilter === "all" || q.content_tag === quoteContentFilter)
    .filter((q) => quoteRelFilter === "all" || q.relationship_tag === quoteRelFilter)
    .sort((a, b) => {
      if (quoteSortBy === "speakers") return quoteSortAsc ? a.speaker_count - b.speaker_count : b.speaker_count - a.speaker_count;
      return quoteSortAsc ? new Date(a.date_added).getTime() - new Date(b.date_added).getTime() : new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
    });

  const selectStyle = "border border-border bg-background text-foreground px-2 py-1 text-sm mr-2 mb-2";
  const ss = { borderRadius: 0 } as const;

  return (
    <div className="mt-8">
      <div className="border-t border-border my-6" />

      {/* PENDING SUGGESTIONS */}
      <h2 className="font-bold mb-4">PENDING SUGGESTIONS</h2>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={sugSpeakerFilter} onChange={(e) => setSugSpeakerFilter(e.target.value)} className={selectStyle} style={ss}>
          <option value="all">all speakers</option>
          {["1", "2", "3", "4", "5", "6+"].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <button onClick={() => { setSugSortBy("speakers"); setSugSortAsc((a) => sugSortBy === "speakers" ? !a : true); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm">
          sort by speakers {sugSortBy === "speakers" ? (sugSortAsc ? "↑" : "↓") : ""}
        </button>
        <button onClick={() => { setSugSortBy("date"); setSugSortAsc((a) => sugSortBy === "date" ? !a : false); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm">
          sort by date {sugSortBy === "date" ? (sugSortAsc ? "↑" : "↓") : ""}
        </button>
      </div>

      {filteredSuggestions.length === 0 && <p className="text-muted-foreground mb-4">no pending suggestions</p>}

      {filteredSuggestions.map((s) => (
        <div key={s.id} className="mb-2">
          <div className="whitespace-pre-wrap mb-1">{s.raw_text}</div>
          <p className="text-sm text-muted-foreground mb-1">
            {s.content_tag || "Content: ?"} | {s.relationship_tag || "Relationship: ?"} — ({s.speaker_count} speakers) — {new Date(s.date_submitted).toLocaleDateString()}
          </p>

          {approving === s.id ? (
            <div className="mb-2">
              <div className="flex gap-2 mb-2">
                <select value={approveContent} onChange={(e) => setApproveContent(e.target.value)} className={selectStyle} style={ss}>
                  <option>SFW</option><option>NSFW</option><option>Both</option>
                </select>
                <select value={approveRelationship} onChange={(e) => setApproveRelationship(e.target.value)} className={selectStyle} style={ss}>
                  <option>Shipping</option><option>Nonshipping</option><option>Both</option>
                </select>
              </div>
              <button onClick={async () => { await approveQuote(s, approveContent, approveRelationship); setApproving(null); load(); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm mr-4">[save]</button>
              <button onClick={() => setApproving(null)} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm">[cancel]</button>
            </div>
          ) : (
            <div className="mb-2">
              <button onClick={() => { setApproving(s.id); setApproveContent(s.content_tag || "Both"); setApproveRelationship(s.relationship_tag || "Both"); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm mr-4">[approve]</button>
              <button onClick={async () => { await deleteSuggestion(s.id); load(); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm">[delete]</button>
            </div>
          )}

          <div className="border-b border-separator mx-2.5 my-3" />
        </div>
      ))}

      {/* MANAGE QUOTES */}
      <h2 className="font-bold mb-4 mt-8">MANAGE QUOTES</h2>

      <div className="mb-4">
        <button onClick={() => setAdding(true)} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm mb-2">add new</button>
      </div>

      {adding && (
        <div className="mb-4 border border-border p-4">
          <textarea value={newText} onChange={(e) => setNewText(e.target.value)} className="w-full border border-border bg-background text-foreground p-2 mb-2" style={{ borderRadius: 0, minHeight: 100 }} placeholder="Person A: dialogue&#10;Person B: dialogue" />
          <div className="flex gap-2 mb-2">
            <select value={newContent} onChange={(e) => setNewContent(e.target.value)} className={selectStyle} style={ss}>
              <option>SFW</option><option>NSFW</option><option>Both</option>
            </select>
            <select value={newRelationship} onChange={(e) => setNewRelationship(e.target.value)} className={selectStyle} style={ss}>
              <option>Shipping</option><option>Nonshipping</option><option>Both</option>
            </select>
          </div>
          <button onClick={async () => { if (!newText.trim()) return; await addQuote(newText, newContent, newRelationship); setAdding(false); setNewText(""); load(); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm mr-4">[save]</button>
          <button onClick={() => { setAdding(false); setNewText(""); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm">[cancel]</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={quoteSpeakerFilter} onChange={(e) => setQuoteSpeakerFilter(e.target.value)} className={selectStyle} style={ss}>
          <option value="all">all speakers</option>
          {["1", "2", "3", "4", "5", "6+"].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={quoteContentFilter} onChange={(e) => setQuoteContentFilter(e.target.value)} className={selectStyle} style={ss}>
          <option value="all">all content</option>
          <option>SFW</option><option>NSFW</option><option>Both</option>
        </select>
        <select value={quoteRelFilter} onChange={(e) => setQuoteRelFilter(e.target.value)} className={selectStyle} style={ss}>
          <option value="all">all relationship</option>
          <option>Shipping</option><option>Nonshipping</option><option>Both</option>
        </select>
        <button onClick={() => { setQuoteSortBy("speakers"); setQuoteSortAsc((a) => quoteSortBy === "speakers" ? !a : true); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm">
          sort by speakers {quoteSortBy === "speakers" ? (quoteSortAsc ? "↑" : "↓") : ""}
        </button>
        <button onClick={() => { setQuoteSortBy("date"); setQuoteSortAsc((a) => quoteSortBy === "date" ? !a : false); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm">
          sort by date {quoteSortBy === "date" ? (quoteSortAsc ? "↑" : "↓") : ""}
        </button>
      </div>

      {filteredQuotes.length === 0 && <p className="text-muted-foreground mb-4">no quotes</p>}

      {filteredQuotes.map((q) => (
        <div key={q.id} className="mb-2">
          {editing === q.id ? (
            <div className="mb-2">
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full border border-border bg-background text-foreground p-2 mb-2" style={{ borderRadius: 0, minHeight: 100 }} />
              <div className="flex gap-2 mb-2">
                <select value={editContent} onChange={(e) => setEditContent(e.target.value)} className={selectStyle} style={ss}>
                  <option>SFW</option><option>NSFW</option><option>Both</option>
                </select>
                <select value={editRelationship} onChange={(e) => setEditRelationship(e.target.value)} className={selectStyle} style={ss}>
                  <option>Shipping</option><option>Nonshipping</option><option>Both</option>
                </select>
              </div>
              <button onClick={async () => { await updateQuote(q.id, editText, editContent, editRelationship); setEditing(null); load(); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm mr-4">[save]</button>
              <button onClick={() => setEditing(null)} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm">[cancel]</button>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap mb-1">{q.raw_text}</div>
              <p className="text-sm text-muted-foreground mb-1">
                {q.content_tag} | {q.relationship_tag} — ({q.speaker_count} speakers) — {new Date(q.date_added).toLocaleDateString()}
              </p>
              <div className="mb-2">
                <button onClick={() => { setEditing(q.id); setEditText(q.raw_text); setEditContent(q.content_tag); setEditRelationship(q.relationship_tag); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm mr-4">[edit]</button>
                <button onClick={async () => { await deleteQuote(q.id); load(); }} className="underline cursor-pointer bg-transparent border-none p-0 text-foreground text-sm">[delete]</button>
              </div>
            </>
          )}
          <div className="border-b border-separator mx-2.5 my-3" />
        </div>
      ))}
    </div>
  );
}
