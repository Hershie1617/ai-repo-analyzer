import { useState } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeRepo = async () => {
    if (!url) return;
    setLoading(true); setError(null); setResult(null);

    try {
      const response = await fetch(`https://ai-repo-analyzer-jus7.onrender.com/analyze?url=${url}`);     
       if (!response.ok) throw new Error("Failed to fetch analysis.");
      
      const rawText = await response.text(); 
      // We parse the string into an actual JavaScript Object!
      const jsonData = JSON.parse(rawText); 
      setResult(jsonData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto mt-12">
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">
          AI Repo Analyzer
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          Paste a GitHub repository link to generate a structured AI breakdown.
        </p>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="https://github.com/facebook/react"
            className="flex-1 p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={analyzeRepo}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Analyze'}
          </button>
        </div>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl mb-8">{error}</div>}

        {/* The Magic: Mapping JSON to UI Elements */}
        {result && (
          <div className="space-y-6">
            
            {/* Summary & Architecture Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-blue-400">Project Overview</h2>
                <span className="bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                  {result.architecture}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">{result.description}</p>
            </div>

            {/* Tech Stack Badges */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-blue-400 mb-4">Core Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {result.techStack.map((tech, index) => (
                  <span key={index} className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium border border-gray-600 shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Dependencies List */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-blue-400 mb-4">Key Dependencies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.keyDependencies.map((dep, index) => (
                  <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                    <span className="font-mono text-green-400 block mb-1">{dep.name}</span>
                    <span className="text-gray-400 text-sm">{dep.purpose}</span>
                  </div>
                ))}
              </div>
            </div>

{/* --- Health Audit Section --- */}
<div className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-bold text-white">Health & Security Audit</h3>
    {/* Dynamic Badge Color based on Score */}
    <span className={`px-4 py-1 rounded-full text-sm font-bold ${
      result.healthScore === 'A' ? 'bg-green-500/20 text-green-400' : 
      result.healthScore === 'B' ? 'bg-blue-500/20 text-blue-400' :
      result.healthScore === 'C' ? 'bg-yellow-500/20 text-yellow-400' :
      'bg-red-500/20 text-red-400'
    }`}>
      Grade: {result.healthScore || 'N/A'}
    </span>
  </div>

  {result.actionableImprovements && result.actionableImprovements.length > 0 ? (
    <ul className="space-y-3">
      {result.actionableImprovements.map((improvement, index) => (
        <li key={index} className="flex flex-col gap-2 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
          <span className="text-gray-300 font-medium text-sm">⚠️ {improvement.issue}</span>
          <code className="text-xs bg-black p-2 rounded text-green-400 font-mono mt-1">
            {improvement.fixCommand}
          </code>
        </li>
      ))}
    </ul>
  ) : (
    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-4 animate-pulse duration-1000">
      <div className="bg-green-500/20 p-2 rounded-full">
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div>
        <p className="text-green-400 font-bold text-lg">Perfect Health Score</p>
        <p className="text-green-500/70 text-sm">Repository structure is optimized. No critical vulnerabilities or missing dependencies detected.</p>
      </div>
    </div>
  )}
</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App