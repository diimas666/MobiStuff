'use client';

export default function RetryButton() {
  return (
    <button type="button" onClick={() => location.reload()} className="btn-primary btn-lg mt-8">
      Спробувати ще раз
    </button>
  );
}
