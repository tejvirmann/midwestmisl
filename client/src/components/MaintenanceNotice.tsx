import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function MaintenanceNotice() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/notify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-orange-500 mb-3">Midwest MISL</h1>
        <p className="text-lg mb-2">Sorry — the map is temporarily down.</p>
        <p className="text-muted-foreground mb-6">
          We're getting a lot of traffic right now. It will be back soon. Leave your email and
          we'll let you know when it's back.
        </p>

        {status === "done" ? (
          <p className="text-green-600 font-medium">Thank you! We'll email you when the map is back.</p>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              required
              maxLength={254}
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Button
              type="submit"
              disabled={status === "sending"}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notify me"}
            </Button>
          </form>
        )}
        {status === "error" && <p className="text-destructive text-sm mt-3">{message}</p>}
      </div>
    </div>
  );
}
