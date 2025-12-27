'use client';

import { FormEvent, useMemo, useState } from 'react';

type SearchResult = {
  bookName: string;
  page: number;
  status: string;
  snippet: string;
};

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(() => {
    return loading || !files || files.length === 0 || query.trim().length === 0;
  }, [files, loading, query]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      Array.from(files ?? []).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('query', query.trim());

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze files');
      }

      const data = (await response.json()) as { results: SearchResult[] };
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '64px 16px' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
          padding: 40
        }}
      >
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 36, fontWeight: 700 }}>Hadith Status Agent</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: 18 }}>
            Upload your hadith books (PDF) and search for a narrator&apos;s status. The agent scans each page
            for mentions and highlights if the narrator is described as Thiqah or Zaeef.
          </p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: 24,
              border: '2px dashed #cbd5f5',
              borderRadius: 16,
              background: '#f8fafc'
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 16 }}>1. Add PDF books</span>
            <span style={{ color: '#64748b' }}>Select one or more PDF files to analyze.</span>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(event) => setFiles(event.target.files)}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>2. Narrator name</span>
            <input
              type="text"
              placeholder="Enter narrator, e.g. Ravi"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid #cbd5f5',
                fontSize: 16,
                background: '#fff'
              }}
            />
          </label>

          <button
            type="submit"
            disabled={disabled}
            style={{
              padding: '16px 22px',
              borderRadius: 12,
              border: 'none',
              background: disabled ? '#cbd5f5' : '#2563eb',
              color: '#fff',
              fontSize: 18,
              fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            {loading ? 'Analyzing…' : 'Analyze Books'}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 12,
              background: '#fee2e2',
              color: '#991b1b'
            }}
          >
            {error}
          </div>
        )}

        {results.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>Matches</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 640 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.04 }}>Book</th>
                    <th style={{ padding: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.04 }}>Page</th>
                    <th style={{ padding: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.04 }}>Status</th>
                    <th style={{ padding: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.04 }}>Context</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={`${result.bookName}-${result.page}-${index}`}
                      style={{
                        background: index % 2 === 0 ? '#fff' : '#f8fafc',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <td style={{ padding: 14, fontWeight: 600 }}>{result.bookName}</td>
                      <td style={{ padding: 14 }}>{result.page}</td>
                      <td style={{ padding: 14, fontWeight: 600, color: result.status === 'Thiqah' ? '#15803d' : '#b91c1c' }}>
                        {result.status || 'Unknown'}
                      </td>
                      <td style={{ padding: 14, whiteSpace: 'pre-wrap', color: '#475569' }}>{result.snippet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
