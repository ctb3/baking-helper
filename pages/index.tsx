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

export default function App() {
  const [weight, setWeight] = useState("");
  const [numberOfItems, setNumberOfItems] = useState("");
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState("");
  const wakeLock = useWakeLock();

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
    <main className="min-h-screen flex items-start sm:items-center justify-center bg-gray-100 p-4">
      <Head>
        <title>Dough Divider</title>
        <meta
          name="description"
          content="Divide dough into equal pieces using countdown scale readings."
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
          <div className="mt-6">
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
                  <span className="text-xl font-semibold tabular-nums">{reading}g</span>
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
    </main>
  );
}
