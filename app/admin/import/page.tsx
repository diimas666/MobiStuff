'use client';
// ImportPage с прогрессбаром: !!!!!!!!!!!!!!!!!!!!!!!!!!! проверь
import { useState } from 'react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        alert('✅ Товари імпортовані!');
        setProgress(0);
        setFile(null);
      } else {
        alert(`❌ Помилка: ${xhr.responseText}`);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      alert('❌ Помилка завантаження');
    };

    xhr.open('POST', '/api/admin/import');
    setUploading(true);
    xhr.send(formData);
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
        disabled={!file || uploading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? 'Завантаження...' : 'Завантажити'}
      </button>

      {uploading && (
        <div className="h-4 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
