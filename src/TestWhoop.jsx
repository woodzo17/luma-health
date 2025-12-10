import React from 'react'
import WhoopConnect from './components/WhoopConnect'

export default function TestWhoop() {
  return (
    <div className="min-h-screen bg-stone-900 text-white p-8 font-inter flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="font-playfair text-4xl text-holo-blue">Whoop Integration Test</h1>
          <p className="text-stone-400">
            Isolated environment for testing API connectivity and data visualization.
          </p>
        </div>

        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-sm">
            <WhoopConnect />
        </div>

        <div className="text-center">
            <a href="/" className="text-sm text-stone-500 hover:text-white transition-colors">
                ← Back to Main Application
            </a>
        </div>
      </div>
    </div>
  )
}
