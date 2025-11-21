import { useState, useEffect } from "react";
import {
  saveResult,
  loadResults,
  setRecommendationEnabled,
  getRecommendationStore,
  applyRecommendations,
} from "../lib/screenerStore";

interface Props {
  onClose: () => void;
}

export const VisualCrowdingScreener = ({ onClose }: Props) => {
  const [letterSpacing, setLetterSpacing] = useState<number>(0); // px
  const [lineHeight, setLineHeight] = useState<number>(1.2); // unitless
  const [fontWeight, setFontWeight] = useState<number>(400);
  const [showResults, setShowResults] = useState(false);
  const [recommendedEnabled, setRecommendedEnabled] = useState<boolean>(false);
  const [history, setHistory] = useState<any[]>([]);

  // Apply live preview when sliders change (temporary, non-persistent)
  useEffect(() => {
    try {
      // Apply recommendations live but do not persist to localStorage.
      applyRecommendations({
        enabled: true,
        letterSpacing,
        lineHeight,
        fontWeight,
      });
    } catch (e) {
      console.error("Failed to apply live preview", e);
    }
  }, [letterSpacing, lineHeight, fontWeight]);

  const sampleText = `The quick brown fox jumps over the lazy dog. This passage is intentionally dense to challenge the visual processing system. Adjust the sliders until the text stops 'swimming' or feels comfortable.`;

  function computeScore() {
    // Normalized adjustments
    const spacingNorm = Math.min(Math.max(letterSpacing / 8, 0), 1); // 0..1 (0px..8px)
    const lhNorm = Math.min(Math.max((lineHeight - 1.2) / 0.8, -1), 1); // -1..1 but we'll take abs
    const weightNorm = Math.min(Math.max((fontWeight - 400) / 500, -1), 1); // -1..1

    const adjScore =
      0.5 * Math.abs(spacingNorm) +
      0.3 * Math.abs(lhNorm) +
      0.2 * Math.abs(weightNorm);

    // Map adjustment to risk level (1-5). Higher adjScore => higher risk (lower number)
    // adjScore 0 => level 5 (No Risk). adjScore >= ~0.6 => level 1
    let level = 5 - Math.round((adjScore / 0.8) * 4);
    if (level < 1) level = 1;
    if (level > 5) level = 5;
    return { adjScore, level };
  }

  const { adjScore, level } = computeScore();

  // level is used directly in the results UI; no separate label function required.

  function handleFinish() {
    setShowResults(true);
  }

  useEffect(() => {
    try {
      const store = getRecommendationStore();
      setRecommendedEnabled(!!store?.enabled);
      setHistory(loadResults());
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="p-6 w-full h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-['Comic_Sans_MS']">
          Visual Crowding Screener
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setLetterSpacing(0);
              setLineHeight(1.2);
              setFontWeight(400);
              setShowResults(false);
            }}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-purple-400 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <p className="mb-3">
          Adjust the sliders until the text stops 'swimming' or feels
          comfortable.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Letter Spacing: <span className="font-mono">{letterSpacing}px</span>
          </label>
          <input
            type="range"
            min={0}
            max={8}
            step={0.5}
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(Number(e.target.value))}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Line Height:{" "}
            <span className="font-mono">{lineHeight.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={1.0}
            max={2.0}
            step={0.05}
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Font Weight: <span className="font-mono">{fontWeight}</span>
          </label>
          <input
            type="range"
            min={300}
            max={900}
            step={50}
            value={fontWeight}
            onChange={(e) => setFontWeight(Number(e.target.value))}
          />
        </div>

        <div className="mb-4">
          <div
            className="p-4 border rounded"
            style={{
              letterSpacing: `${letterSpacing}px`,
              lineHeight: `${lineHeight}`,
              fontWeight,
            }}
          >
            {recommendedEnabled ? (
              <div className="p-2 bg-gray-50 rounded">
                (OpenDyslexic font + Line Focus applied)
              </div>
            ) : null}
            <p>{sampleText}</p>
            <p className="mt-3 text-sm text-gray-600">
              Try increasing letter spacing and line height if the text swims.
              Use heavier weights for better contrast if needed.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleFinish}
            className="px-4 py-2 bg-green-400 text-white rounded"
          >
            I'm comfortable
          </button>
          <button
            onClick={() => {
              setRecommendedEnabled(!recommendedEnabled);
            }}
            className="px-4 py-2 bg-blue-300 text-white rounded"
          >
            Toggle Recommendation
          </button>
        </div>
      </div>

      {showResults ? (
        <div className="bg-[#F3F6FB] border rounded p-4">
          <h3 className="font-semibold mb-2">Cognitive Profile Report</h3>
          <div className="grid grid-cols-6 gap-2 text-sm items-center mb-4">
            <div className="col-span-2 font-bold">Category</div>
            <div className="text-center">
              1<br />
              High Risk
            </div>
            <div className="text-center">2</div>
            <div className="text-center">
              3<br />
              Neutral
            </div>
            <div className="text-center">4</div>
            <div className="text-center">
              5<br />
              No Risk
            </div>

            <div className="col-span-2">Visual Crowding Risk</div>
            <div
              className={`text-center ${
                level === 1
                  ? "text-white bg-red-400 rounded-full w-6 mx-auto"
                  : ""
              }`}
            >
              {" "}
              {level === 1 ? "X" : ""}{" "}
            </div>
            <div
              className={`text-center ${
                level === 2
                  ? "text-white bg-pink-300 rounded-full w-6 mx-auto"
                  : ""
              }`}
            >
              {" "}
              {level === 2 ? "X" : ""}{" "}
            </div>
            <div
              className={`text-center ${
                level === 3
                  ? "text-white bg-yellow-200 rounded-full w-6 mx-auto"
                  : ""
              }`}
            >
              {" "}
              {level === 3 ? "X" : ""}{" "}
            </div>
            <div
              className={`text-center ${
                level === 4
                  ? "text-white bg-green-200 rounded-full w-6 mx-auto"
                  : ""
              }`}
            >
              {" "}
              {level === 4 ? "X" : ""}{" "}
            </div>
            <div
              className={`text-center ${
                level === 5
                  ? "text-white bg-green-400 rounded-full w-6 mx-auto"
                  : ""
              }`}
            >
              {" "}
              {level === 5 ? "X" : ""}{" "}
            </div>

            <div className="col-span-2">Contrast Sensitivity</div>
            <div className="text-center"> </div>
            <div className="text-center"> </div>
            <div className="text-center"> </div>
            <div className="text-center">X</div>
            <div className="text-center"> </div>

            <div className="col-span-2">Phonological Awareness</div>
            <div className="text-center"> </div>
            <div className="text-center">X</div>
            <div className="text-center"> </div>
            <div className="text-center"> </div>
            <div className="text-center"> </div>

            <div className="col-span-2">Focus & Attention Span</div>
            <div className="text-center"> </div>
            <div className="text-center"> </div>
            <div className="text-center">X</div>
            <div className="text-center"> </div>
            <div className="text-center"> </div>
          </div>

          <div className="bg-white p-3 rounded border">
            <strong>AI Recommendation:</strong>
            <p className="mt-2">
              Based on these results, we have automatically recommended enabling{" "}
              <span className="font-semibold">OpenDyslexic Font</span> and{" "}
              <span className="font-semibold">Line Focus Mode</span>. We also
              recommend enabling "AudioSync" for dense reading materials.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setRecommendationEnabled(true, {
                    letterSpacing,
                    lineHeight,
                    fontWeight,
                  });
                  setRecommendedEnabled(true);
                }}
                className="px-4 py-2 bg-indigo-500 text-white rounded"
              >
                Enable Recommended
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Back
              </button>
              <button
                onClick={() => {
                  const now = new Date().toISOString();
                  const toSave = {
                    date: now,
                    letterSpacing,
                    lineHeight,
                    fontWeight,
                    level,
                    adjScore,
                  };
                  saveResult(toSave as any);
                  setHistory(loadResults());
                }}
                className="px-4 py-2 bg-green-200 rounded"
              >
                Save Result
              </button>
            </div>
          </div>

          {history.length > 0 ? (
            <div className="mt-4 bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2">Saved Results</h4>
              <ul className="space-y-2 text-sm">
                {history.map((h, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {new Date(h.date).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        Spacing: {h.letterSpacing}px · Line H:{" "}
                        {h.lineHeight.toFixed(2)} · Weight: {h.fontWeight} ·
                        Level: {h.level}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Score: {h.adjScore.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default VisualCrowdingScreener;
