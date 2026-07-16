'use client';

import { useState } from 'react';
import Link from 'next/link';

const platforms = ['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok'];
const tones = ['Professional', 'Casual', 'Funny', 'Inspirational', 'Educational', 'Promotional'];

export default function GeneratePage() {
  const [businessType, setBusinessType] = useState('');
  const [platform, setPlatform] = useState('Twitter');
  const [tone, setTone] = useState('Professional');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType,
          platform,
          tone,
          topic,
          keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            ← Back to Home
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Generate Content
          </h1>
          <p className="mt-2 text-gray-600">
            Create engaging social media content for your business
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g., Coffee Shop, Tech Startup, Fitness Coach"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {platforms.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone *
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., New Product Launch, Holiday Sale"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (Optional, comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., coffee, morning, energy, fresh"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !businessType}
            className="mt-6 w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Generated Content</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Post</h3>
                <p className="p-4 bg-gray-50 rounded-lg">{result.post}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Hashtags</h3>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags?.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Caption</h3>
                <p className="p-4 bg-gray-50 rounded-lg">{result.caption}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Call to Action</h3>
                <p className="p-4 bg-gray-50 rounded-lg">{result.callToAction}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => navigator.clipboard.writeText(result.post)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Copy Post
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(result.hashtags?.join(' '))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Copy Hashtags
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
