import { useState } from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "@/components/DarkModeToggle";
import { submitSuggestion } from "@/lib/quotes";

interface QuoteEntry {
  text: string;
  contentTag: string;
  relationshipTag: string;
}

export default function Submit() {
  const [entries, setEntries] = useState<QuoteEntry[]>([
    { text: "", contentTag: "I'm not sure", relationshipTag: "I'm not sure" },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEntry = (index: number, field: keyof QuoteEntry, value: string) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, { text: "", contentTag: "I'm not sure", relationshipTag: "I'm not sure" }]);
  };

  const handleSubmit = async () => {
    setError(null);
    const empty = entries.findIndex((e) => !e.text.trim());
    if (empty !== -1) {
      setError(`quote ${empty + 1} is empty`);
      return;
    }

    try {
      for (const entry of entries) {
        await submitSuggestion(entry.text, entry.contentTag, entry.relationshipTag);
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "failed to submit");
    }
  };

  const selectStyle = "border border-border bg-background text-foreground px-2 py-1 text-sm";
  const ss = { borderRadius: 0 } as const;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DarkModeToggle />
        <div className="p-[50px] md:p-0 md:py-[50px]">
          <div className="border border-border p-8 md:p-12 max-w-[800px] mx-auto">
            <p className="mb-4">
              thank you — your {entries.length > 1 ? "quotes have" : "quote has"} been sent for review
            </p>
            <Link to="/" className="text-foreground underline">
              back to generator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DarkModeToggle />
      <div className="p-[50px] md:p-0 md:py-[50px]">
        <div className="border border-border p-8 md:p-12 max-w-[800px] mx-auto">
          <h1 className="text-2xl font-bold mb-6">Submit</h1>

          <div className="mb-6 text-sm leading-relaxed">
            <p className="mb-2">Enter your quote using this format:</p>
            <p className="mb-1 font-mono text-xs">CharacterName: dialogue line</p>
            <p className="mb-1 font-mono text-xs">CharacterName: dialogue line</p>
            <p className="mb-4">
              You can use generic names like person a, Person A, person A, Person a – they will all be
              recognized as placeholders and can be replaced later with custom names.
            </p>
            <p className="mb-4">
              You can also include the character names in narrative text – for example:
            </p>
            <p className="mb-1 font-mono text-xs">
              The demon Person A summoned, standing amidst the destroyed kitchen: How?!
            </p>
            <p className="mb-4 font-mono text-xs">
              Person A, flipping through a cookbook: I don't know!!
            </p>
            <p className="mb-4">
              (Character names will be automatically detected from both dialogue labels and narrative mentions.)
            </p>
            <p>Please make sure to tag accordingly. If unsure, please select the option "I'm not sure".</p>
          </div>

          {error && <p className="mb-4 text-foreground font-bold">{error}</p>}

          {entries.map((entry, i) => (
            <div key={i} className="mb-6">
              {entries.length > 1 && (
                <p className="text-sm text-muted-foreground mb-1">quote {i + 1}</p>
              )}
              <textarea
                value={entry.text}
                onChange={(e) => updateEntry(i, "text", e.target.value)}
                className="w-full border border-border bg-background text-foreground p-2 mb-3"
                style={{ borderRadius: 0, minHeight: 120 }}
                placeholder={"Person A: dialogue line\nPerson B: dialogue line"}
              />
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-sm block mb-1">content:</label>
                  <select value={entry.contentTag} onChange={(e) => updateEntry(i, "contentTag", e.target.value)} className={selectStyle} style={ss}>
                    <option>I'm not sure</option>
                    <option>SFW</option>
                    <option>NSFW</option>
                    <option>Both</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm block mb-1">relationship:</label>
                  <select value={entry.relationshipTag} onChange={(e) => updateEntry(i, "relationshipTag", e.target.value)} className={selectStyle} style={ss}>
                    <option>I'm not sure</option>
                    <option>Shipping</option>
                    <option>Nonshipping</option>
                    <option>Both</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addEntry}
            className="text-foreground underline cursor-pointer bg-transparent border-none p-0 text-sm mb-6 block"
          >
            add another quote
          </button>

          <button
            onClick={handleSubmit}
            className="border border-border bg-background text-foreground cursor-pointer"
            style={{ borderRadius: 0, padding: "5px 12px", textAlign: "center" }}
          >
            {entries.length > 1 ? "submit all quotes" : "submit"}
          </button>

          <div className="mt-8">
            <Link to="/" className="text-foreground hover:underline text-sm">
              ← back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
