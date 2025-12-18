// app/admin/reset/page.tsx
'use client';

import { useState } from 'react';

export default function AdminResetPage() {
  const [ftCode, setFtCode] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/checkin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ftCode: ftCode.toUpperCase() })
      });

      const data = await response.json();
      setMessage(data.message);
      setFtCode('');
    } catch (error) {
      setMessage('Алдаа гарлаа');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Admin - Reset Check-in</h1>
        
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">FT Код</label>
            <input
              type="text"
              value={ftCode}
              onChange={(e) => setFtCode(e.target.value)}
              placeholder="FT0001"
              className="w-full px-4 py-2 border rounded-lg uppercase"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
          >
            Reset хийх
          </button>
        </form>

        {message && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}