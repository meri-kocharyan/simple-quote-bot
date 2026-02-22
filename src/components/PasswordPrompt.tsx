import { useState } from "react";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PasswordPrompt({ onSuccess, onCancel }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (password === "iloveluffy") {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => onCancel(), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="border border-border bg-background p-6 z-50">
        {error ? (
          <p>incorrect</p>
        ) : (
          <>
            <p className="mb-2">
              password:{" "}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="border border-border bg-background text-foreground px-2 py-1"
                style={{ borderRadius: 0 }}
                autoFocus
              />
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="border border-border bg-background text-foreground px-2 py-1 cursor-pointer"
                style={{ borderRadius: 0 }}
              >
                submit
              </button>
              <button
                onClick={onCancel}
                className="text-foreground underline cursor-pointer bg-transparent border-none p-0"
              >
                cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
