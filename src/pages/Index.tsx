import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "@/components/DarkModeToggle";
import QuoteDisplay from "@/components/QuoteDisplay";
import PasswordPrompt from "@/components/PasswordPrompt";
import AdminPanel from "@/components/AdminPanel";
import { fetchQuotes, getQuoteCounts, type Quote, type QuoteLine } from "@/lib/quotes";

export default function Index() {
  const [speakerCount, setSpeakerCount] = useState("any");
  const [contentFilter, setContentFilter] = useState("Both SFW and NSFW");
  const [relationshipFilter, setRelationshipFilter] = useState("Both Shipping and Nonshipping");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentLines, setCurrentLines] = useState<QuoteLine[] | null>(null);
  const [names, setNames] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const recentIds = useRef<string[]>([]);

  const loadQuotes = useCallback(async () => {
    const [q, c] = await Promise.all([
      fetchQuotes({ speakerCount, content: contentFilter, relationship: relationshipFilter }),
      getQuoteCounts(),
    ]);
    setQuotes(q);
    setCounts(c);
    recentIds.current = [];
    setCurrentLines(null);
  }, [speakerCount, contentFilter, relationshipFilter]);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  const getRandomQuote = () => {
    if (quotes.length === 0) {
      setCurrentLines([]);
      return;
    }
    if (quotes.length === 1) {
      setCurrentLines(quotes[0].formatted_quote);
      return;
    }

    const maxHistory = quotes.length <= 2 ? 1 : 2;
    let available = quotes.filter((q) => !recentIds.current.includes(q.id));
    if (available.length === 0) available = quotes;

    const pick = available[Math.floor(Math.random() * available.length)];
    recentIds.current.push(pick.id);
    if (recentIds.current.length > maxHistory) recentIds.current.shift();
    setCurrentLines(pick.formatted_quote);
  };

  const userNames = names.split("\n").filter((n) => n.trim());

  const selectStyle = "border border-border bg-background text-foreground px-2 py-1 text-sm";
  const ss = { borderRadius: 0 } as const;

  const handleAdminClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowPasswordPrompt(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DarkModeToggle />
      <div className="p-[50px] md:p-0 md:py-[50px]">
        <div className="border border-border p-8 md:p-12 max-w-[800px] mx-auto">
          {/* Title */}
          <h1 className="text-2xl font-bold mb-8">Incorrect Quote Generator</h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select value={speakerCount} onChange={(e) => setSpeakerCount(e.target.value)} className={selectStyle} style={ss}>
              <option value="any">any ({counts.any || 0})</option>
              {["1", "2", "3", "4", "5", "6+"].map((v) => (
                <option key={v} value={v}>{v} ({counts[v] || 0})</option>
              ))}
            </select>
            <select value={contentFilter} onChange={(e) => setContentFilter(e.target.value)} className={selectStyle} style={ss}>
              <option>Both SFW and NSFW</option>
              <option>SFW</option>
              <option>NSFW</option>
            </select>
            <select value={relationshipFilter} onChange={(e) => setRelationshipFilter(e.target.value)} className={selectStyle} style={ss}>
              <option>Both Shipping and Nonshipping</option>
              <option>Shipping</option>
              <option>Nonshipping</option>
            </select>
          </div>

          {/* Generate button */}
          <button
            onClick={getRandomQuote}
            className="border border-border bg-background text-foreground cursor-pointer"
            style={{ borderRadius: 0, padding: "5px 12px", textAlign: "center" }}
          >
            get quote
          </button>

          {/* Name replacement */}
          <div className="mt-6">
            <label className="block mb-1 text-sm">
              replace person a, person b, etc. with names (one per line):
            </label>
            <textarea
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder={"Mario\nLuigi\nPeach"}
              className="w-full border border-border bg-background text-foreground p-2"
              style={{ borderRadius: 0, minHeight: 80 }}
            />
          </div>

          {/* Quote display */}
          <QuoteDisplay lines={currentLines} userNames={userNames} />

          {/* Admin panel */}
          {isAdmin && <AdminPanel />}

          {/* Submit link */}
          <div className="text-right mt-8">
            <Link to="/submit" className="text-foreground hover:underline">
              submit quote
            </Link>
          </div>

          {/* Hidden admin trigger */}
          <div className="text-right mt-1">
            <button
              onClick={handleAdminClick}
              className={`bg-transparent border-none p-0 cursor-pointer text-sm ${
                isAdmin
                  ? "text-foreground"
                  : "text-admin-hidden hover:text-foreground"
              }`}
            >
              {isAdmin ? "admin" : "a"}
            </button>
          </div>
        </div>
      </div>

      {showPasswordPrompt && (
        <PasswordPrompt
          onSuccess={() => {
            setIsAdmin(true);
            setShowPasswordPrompt(false);
          }}
          onCancel={() => setShowPasswordPrompt(false)}
        />
      )}
    </div>
  );
}
