import { useState } from "react";

export default function App() {
  const [weight, setWeight] = useState("");
  const [numberOfItems, setNumberOfItems] = useState("");
  const [results, setResults] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalWeight = parseFloat(weight);
    const items = parseInt(numberOfItems);
    
    if (isNaN(totalWeight) || isNaN(items) || items <= 0) {
      return;
    }

    const weightPerItem = totalWeight / items;
    const incrementalWeights = Array.from({ length: items }, (_, i) => 
      Number((totalWeight - (weightPerItem * (i + 1))).toFixed(1))
    );
    
    setResults(incrementalWeights);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Dough Divider</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Total Weight (grams)
            </label>
            <input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter total weight"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="items" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Items
            </label>
            <input
              id="items"
              type="number"
              value={numberOfItems}
              onChange={(e) => setNumberOfItems(e.target.value)}
              placeholder="Enter number of items"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Calculate
          </button>
        </form>
        
        {results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Scale Readings:</h2>
            <div className="space-y-2">
              {results.map((weight, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">Piece {index + 1}:</span>
                  <span className="font-medium">{weight}g</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
