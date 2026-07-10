import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";

function useWakeLock() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const wantedRef = useRef(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    setSupported("wakeLock" in navigator);
  }, []);

  const acquire = useCallback(async () => {
    wantedRef.current = true;
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      sentinel.addEventListener("release", () => setActive(false));
      sentinelRef.current = sentinel;
      setActive(true);
    } catch {
      setActive(false);
    }
  }, []);

  const release = useCallback(() => {
    wantedRef.current = false;
    sentinelRef.current?.release();
    sentinelRef.current = null;
    setActive(false);
  }, []);

  // The browser silently releases the lock when the tab is hidden;
  // re-acquire on return if still wanted.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && wantedRef.current) {
        acquire();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      sentinelRef.current?.release();
    };
  }, [acquire]);

  return { supported, active, acquire, release };
}

const formatGrams = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export default function App() {
  const [weight, setWeight] = useState("");
  const [numberOfItems, setNumberOfItems] = useState("");
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);
  const wakeLock = useWakeLock();

  useEffect(() => {
    if (results.length > 0) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalWeight = parseFloat(weight);
    const items = parseInt(numberOfItems);

    if (isNaN(totalWeight) || totalWeight <= 0) {
      setError("Enter a total weight above 0.");
      return;
    }
    if (isNaN(items) || items <= 0) {
      setError("Enter at least 1 item.");
      return;
    }

    const weightPerItem = totalWeight / items;
    const incrementalWeights = Array.from({ length: items }, (_, i) =>
      Number((totalWeight - weightPerItem * (i + 1)).toFixed(1))
    );

    setError("");
    setResults(incrementalWeights);
    wakeLock.acquire();
  };

  const handleReset = () => {
    setWeight("");
    setNumberOfItems("");
    setResults([]);
    setError("");
    wakeLock.release();
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-start sm:justify-center bg-gray-100 p-4">
      <Head>
        <title>Dough Divider</title>
        <meta
          name="description"
          content="Divide dough into equal pieces using countdown scale readings."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <div className="p-6 sm:p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Dough Divider</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Total Weight (grams)
            </label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="items" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Pieces
            </label>
            <input
              id="items"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={numberOfItems}
              onChange={(e) => setNumberOfItems(e.target.value)}
              placeholder="e.g. 8"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-4 text-lg font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Calculate
          </button>
        </form>

        {results.length > 0 && (
          <div ref={resultsRef} className="mt-6 scroll-mt-4">
            <h2 className="text-lg font-semibold mb-1">Scale Readings</h2>
            <p className="text-sm text-gray-500 mb-3">
              Remove dough until the scale shows each reading.
            </p>
            <div className="space-y-2">
              {results.map((reading, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-md"
                >
                  <span className="text-gray-600">Piece {index + 1}</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {formatGrams(reading)}g
                  </span>
                </div>
              ))}
            </div>
            {wakeLock.supported && (
              <button
                type="button"
                onClick={wakeLock.active ? wakeLock.release : wakeLock.acquire}
                className={`mt-4 w-full py-2 px-4 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  wakeLock.active
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {wakeLock.active
                  ? "Screen staying awake — tap to disable"
                  : "Keep screen awake"}
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 w-full py-2 px-4 text-sm rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>
        )}
      </div>
      <footer className="mt-6 pb-[env(safe-area-inset-bottom)] text-center text-sm text-gray-500">
        <a
          href="https://github.com/ctb3/baking-helper"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          GitHub
        </a>
      </footer>
    </main>
  );
}
