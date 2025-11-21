import React from "react";

interface PricingPageProps {
  onClose?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onClose }) => {
  return (
    <div className="w-full h-full bg-[#F8F7FF] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 border-b border-purple-200">
        <h2 className="text-2xl font-bold text-gray-800 font-['Comic_Sans_MS']">Choose Your Plan</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-purple-200 hover:bg-purple-300 text-gray-800 font-['Comic_Sans_MS'] focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Back to App
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-700 mb-6 font-['Comic_Sans_MS']">
            Built for learners with dyslexia: clear text, bionic reading, and listening-first tools.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="rounded-2xl border-2 border-purple-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 font-['Comic_Sans_MS']">Starter</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">$0</p>
                <p className="text-sm text-gray-600">Best for trying things out</p>
              </div>
              <ul className="space-y-2 text-gray-700 font-['Comic_Sans_MS']">
                <li>• AI chat with simple language</li>
                <li>• Bionic reading with yellow highlight</li>
                <li>• 5 PDF summaries/day</li>
                <li>• Mind map preview (limited)</li>
                <li>• Web TTS fallback</li>
                <li>• Community support</li>
              </ul>
              <button className="mt-6 w-full bg-purple-100 hover:bg-purple-200 text-gray-800 font-semibold py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
                Get Started
              </button>
            </div>

            {/* ScholarPro */}
            <div className="rounded-2xl border-4 border-purple-400 bg-white p-6 shadow-md relative">
              <span className="absolute -top-3 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-['Comic_Sans_MS']">Popular</span>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 font-['Comic_Sans_MS']">ScholarPro</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">$3</p>
                <p className="text-sm text-gray-600">Best for daily study</p>
              </div>
              <ul className="space-y-2 text-gray-700 font-['Comic_Sans_MS']">
                <li>• Everything in Starter</li>
                <li>• Unlimited chat + memory</li>
                <li>• 50 PDF summaries/month</li>
                <li>• High-quality TTS (Mark) up to 3 hrs/month</li>
                <li>• Full mind maps + SVG export</li>
                <li>• Note saving and quick recall</li>
                <li>• Priority responses</li>
              </ul>
              <button className="mt-6 w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
                Upgrade to ScholarPro
              </button>
            </div>

            {/* Campus */}
            <div className="rounded-2xl border-2 border-purple-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 font-['Comic_Sans_MS']">Campus</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">$5</p>
                <p className="text-sm text-gray-600">Best for classrooms & labs</p>
              </div>
              <ul className="space-y-2 text-gray-700 font-['Comic_Sans_MS']">
                <li>• Everything in ScholarPro</li>
                <li>• Shared class library</li>
                <li>• Teacher dashboard & progress</li>
                <li>• Longer TTS: 6 hrs/month</li>
                <li>• Custom prompts and templates</li>
                <li>• Priority support</li>
              </ul>
              <button className="mt-6 w-full bg-purple-100 hover:bg-purple-200 text-gray-800 font-semibold py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
                Contact Campus
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6 font-['Comic_Sans_MS']">Prices are monthly in USD. TTS minutes are pooled per account. Exports require modern browsers.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
