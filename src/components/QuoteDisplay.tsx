import { QuoteLine, replaceNames, buildNameMap } from "@/lib/quotes";
import { Link } from "react-router-dom";

interface Props {
  lines: QuoteLine[] | null;
  userNames: string[];
}

export default function QuoteDisplay({ lines, userNames }: Props) {
  if (lines === null) {
    return null;
  }

  if (lines.length === 0) {
    return (
      <div className="my-8">
        <p>
          no quotes yet, want to{" "}
          <Link to="/submit" className="underline">
            submit some?
          </Link>
        </p>
      </div>
    );
  }

  const nameMap = buildNameMap(userNames);

  return (
    <div className="my-8">
      {lines.map((line, i) => {
        if (line.isNarrative) {
          const text = replaceNames(line.text, nameMap);
          return (
            <p key={i} className="mb-1 italic">
              {text}
            </p>
          );
        }
        const speaker = replaceNames(line.speaker || "", nameMap);
        const text = replaceNames(line.text, nameMap);
        return (
          <p key={i} className="mb-1">
            <strong>{speaker}:</strong> {text}
          </p>
        );
      })}
    </div>
  );
}
