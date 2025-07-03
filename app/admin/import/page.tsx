'use client';
import { useState } from 'react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/import', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    alert(data.success ? 'Товари імпортовані!' : `Помилка: ${data.error}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Імпорт товарів</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Завантажити
      </button>
    </div>
  );
}
