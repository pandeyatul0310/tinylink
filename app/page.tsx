'use client';

import { useState, useEffect } from 'react';

type Link = {
  id: string;
  code: string;
  targetUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [targetUrl, setTargetUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
      setError('');
    } catch (err) {
      setError('Failed to load links. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Create link
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setFormLoading(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          code: customCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || 'Failed to create link');
        return;
      }

      setSuccessMessage(`Link created successfully! Code: ${data.code}`);
      setTargetUrl('');
      setCustomCode('');
      fetchLinks();

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setFormError('Failed to create link. Please try again.');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete link
  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete the link with code "${code}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete link');

      fetchLinks();
    } catch (err) {
      alert('Failed to delete link. Please try again.');
      console.error(err);
    }
  };

  // Copy to clipboard
  const handleCopy = (code: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const shortUrl = `${baseUrl}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    alert('Link copied to clipboard!');
  };

  // Filter links based on search
  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.targetUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Create Link Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Short Link</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Target URL *
            </label>
            <input
              type="url"
              id="targetUrl"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-1">
              Custom Short Code (optional)
            </label>
            <input
              type="text"
              id="customCode"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="mycode (6-8 alphanumeric characters)"
              pattern="[A-Za-z0-9]{6,8}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to generate a random code
            </p>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {formLoading ? 'Creating...' : 'Create Short Link'}
          </button>
        </form>
      </div>

      {/* Links List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-xl font-semibold mb-4 md:mb-0">Your Links</h2>
          <input
            type="text"
            placeholder="Search by code or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-64"
          />
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">Loading links...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!loading && !error && filteredLinks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No links match your search.' : 'No links yet. Create your first one above!'}
          </div>
        )}

        {!loading && !error && filteredLinks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Short Code</th>
                  <th className="text-left py-3 px-2">Target URL</th>
                  <th className="text-left py-3 px-2">Clicks</th>
                  <th className="text-left py-3 px-2">Last Clicked</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <a
                        href={`/code/${link.code}`}
                        className="text-blue-600 hover:underline font-mono"
                      >
                        {link.code}
                      </a>
                    </td>
                    <td className="py-3 px-2">
                      <div className="max-w-xs truncate" title={link.targetUrl}>
                        {link.targetUrl}
                      </div>
                    </td>
                    <td className="py-3 px-2">{link.clicks}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {formatDate(link.lastClicked)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(link.code)}
                          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleDelete(link.code)}
                          className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
