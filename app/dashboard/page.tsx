'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            ← Back to Home
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your generated content
          </p>
        </div>

        <div className="mb-6">
          <Link
            href="/generate"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Generate New Content
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : content.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start generating social media content for your business
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Generate Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {content.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm font-medium">
                      {item.platform}
                    </span>
                    <span className="ml-2 inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {item.tone}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-800 mb-3">{item.post}</p>

                {item.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.hashtags.map((tag: string, i: number) => (
                      <span key={i} className="text-primary-600 text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-600">{item.caption}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
