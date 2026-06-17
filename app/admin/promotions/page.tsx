'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { adminHeaders } from '@/lib/adminHeaders';
import { catalogCategory } from '@/data/catalogCategory';
import { toast } from 'react-toastify';

type Promotion = {
  _id: string;
  title: string;
  subtitle: string;
  cta: string;
  color: string;
  emoji: string;
  imageUrl?: string;
  imageAssetId?: string;
  linkType: 'category' | 'on_sale';
  categorySlug: string;
  categoryTitle: string;
  subcategorySlug?: string;
  subcategoryTitle?: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = {
  title: '',
  subtitle: '',
  cta: 'До покупок',
  color: '#3D4F5C',
  emoji: '🛍️',
  imageUrl: '',
  imageAssetId: '',
  imagePreviewUrl: '',
  linkType: 'category' as 'category' | 'on_sale',
  categorySlug: '',
  categoryTitle: '',
  subcategorySlug: '',
  subcategoryTitle: '',
  sortOrder: 0,
  isActive: true,
};

const colorPresets = [
  { label: 'Смарагдовий', value: '#3D5A4F' },
  { label: 'Сливовий', value: '#45435F' },
  { label: 'Синій', value: '#3A4A62' },
  { label: 'Графіт', value: '#3D4F5C' },
  { label: 'Бордо', value: '#5C3D4A' },
];

export default function PromotionsAdminPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const subcategories = useMemo(() => {
    const category = catalogCategory.find(item => item.slug === form.categorySlug);
    return category?.subcategories ?? [];
  }, [form.categorySlug]);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promotions', { headers: adminHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Помилка завантаження');
      setPromotions(data.promotions ?? []);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPromotions();
  }, [loadPromotions]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleCategoryChange = (slug: string) => {
    const category = catalogCategory.find(item => item.slug === slug);
    setForm(current => ({
      ...current,
      categorySlug: slug,
      categoryTitle: category?.title ?? '',
      subcategorySlug: '',
      subcategoryTitle: '',
    }));
  };

  const handleSubcategoryChange = (slug: string) => {
    const sub = subcategories.find(item => item.slug === slug);
    setForm(current => ({
      ...current,
      subcategorySlug: slug,
      subcategoryTitle: sub?.title ?? '',
    }));
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('admin_access');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/promotions/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Помилка завантаження');

      setForm(current => ({
        ...current,
        imageAssetId: data.assetId,
        imagePreviewUrl: data.url,
        imageUrl: '',
      }));
      toast.success('Картинку завантажено');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Помилка завантаження');
    } finally {
      setUploadingImage(false);
    }
  };

  const clearImage = () => {
    setForm(current => ({
      ...current,
      imageAssetId: '',
      imagePreviewUrl: '',
      imageUrl: '',
    }));
  };

  const previewImageUrl = form.imagePreviewUrl || form.imageUrl;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.categorySlug) {
      toast.error('Заповніть назву та категорію');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        cta: form.cta,
        color: form.color,
        emoji: form.emoji,
        linkType: form.linkType,
        categorySlug: form.categorySlug,
        categoryTitle: form.categoryTitle,
        subcategorySlug: form.subcategorySlug || undefined,
        subcategoryTitle: form.subcategoryTitle || undefined,
        imageAssetId: form.imageAssetId || null,
        imageUrl: form.imageAssetId ? null : form.imageUrl.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      const res = await fetch('/api/admin/promotions', {
        method: editingId ? 'PATCH' : 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Помилка збереження');

      toast.success(editingId ? 'Акцію оновлено' : 'Акцію додано');
      resetForm();
      await loadPromotions();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (promotion: Promotion) => {
    setEditingId(promotion._id);
    setForm({
      title: promotion.title,
      subtitle: promotion.subtitle,
      cta: promotion.cta,
      color: promotion.color,
      emoji: promotion.emoji,
      imageUrl: promotion.imageAssetId ? '' : promotion.imageUrl ?? '',
      imageAssetId: promotion.imageAssetId ? String(promotion.imageAssetId) : '',
      imagePreviewUrl: promotion.imageUrl ?? '',
      linkType: promotion.linkType,
      categorySlug: promotion.categorySlug,
      categoryTitle: promotion.categoryTitle,
      subcategorySlug: promotion.subcategorySlug ?? '',
      subcategoryTitle: promotion.subcategoryTitle ?? '',
      sortOrder: promotion.sortOrder,
      isActive: promotion.isActive,
    });
  };

  const toggleActive = async (promotion: Promotion) => {
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ id: promotion._id, isActive: !promotion.isActive }),
      });
      if (!res.ok) throw new Error('Помилка оновлення');
      await loadPromotions();
    } catch {
      toast.error('Не вдалося змінити статус');
    }
  };

  const deletePromotion = async (promotion: Promotion) => {
    const confirmed = confirm(
      `Видалити акцію «${promotion.title}»?\n\nВона зникне з додатку без можливості відновлення.`,
    );
    if (!confirmed) return;

    setDeletingId(promotion._id);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'DELETE',
        headers: adminHeaders(),
        body: JSON.stringify({ id: promotion._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Помилка видалення');
      toast.success('Акцію видалено');
      if (editingId === promotion._id) resetForm();
      await loadPromotions();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminWrapper>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Акції на головній</h1>
          <p className="text-gray-600 text-sm">
            Банери в мобільному додатку. Натискання веде в категорію або показує товари зі знижкою.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-lg">
            {editingId ? 'Редагувати акцію' : 'Нова акція'}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Заголовок"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              placeholder="Підзаголовок"
              value={form.subtitle}
              onChange={e => setForm({ ...form, subtitle: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Текст кнопки"
              value={form.cta}
              onChange={e => setForm({ ...form, cta: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Емодзі (якщо без картинки)"
              value={form.emoji}
              onChange={e => setForm({ ...form, emoji: e.target.value })}
              className="border p-2 rounded"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-dashed border-gray-300 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
                {uploadingImage ? 'Завантаження...' : 'Завантажити картинку'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={e => {
                    const file = e.target.files?.[0] ?? null;
                    void handleImageUpload(file);
                    e.target.value = '';
                  }}
                />
              </label>
              {previewImageUrl ? (
                <button
                  type="button"
                  onClick={clearImage}
                  className="rounded-lg bg-gray-200 px-3 py-2 text-sm"
                >
                  Прибрати картинку
                </button>
              ) : null}
            </div>
            <p className="text-xs text-gray-500">
              JPG, PNG або WebP до 5 МБ. Файл зберігається на сервері і показується в додатку.
            </p>
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt="Превʼю банера"
                className="h-28 w-28 rounded-lg bg-gray-100 object-contain"
              />
            ) : null}
            <div>
              <input
                placeholder="Або вставте зовнішнє посилання (https://...)"
                value={form.imageUrl}
                onChange={e =>
                  setForm({
                    ...form,
                    imageUrl: e.target.value,
                    imageAssetId: '',
                    imagePreviewUrl: '',
                  })
                }
                disabled={Boolean(form.imageAssetId)}
                className="w-full rounded border p-2 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={form.linkType}
              onChange={e =>
                setForm({ ...form, linkType: e.target.value as 'category' | 'on_sale' })
              }
              className="border p-2 rounded"
            >
              <option value="category">Відкрити категорію</option>
              <option value="on_sale">Тільки зі знижкою</option>
            </select>

            <select
              value={form.categorySlug}
              onChange={e => handleCategoryChange(e.target.value)}
              className="border p-2 rounded"
              required
            >
              <option value="">Категорія</option>
              {catalogCategory.map(category => (
                <option key={category.slug} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>

            <select
              value={form.subcategorySlug}
              onChange={e => handleSubcategoryChange(e.target.value)}
              className="border p-2 rounded"
              disabled={subcategories.length === 0}
            >
              <option value="">Уся категорія</option>
              {subcategories.map(sub => (
                <option key={sub.slug} value={sub.slug}>
                  {sub.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Колір банера</label>
              <div className="flex gap-2 flex-wrap">
                {colorPresets.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    title={preset.label}
                    onClick={() => setForm({ ...form, color: preset.value })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      form.color === preset.value ? 'border-black' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: preset.value }}
                  />
                ))}
              </div>
              <input
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className="border p-2 rounded mt-2 w-full"
              />
            </div>

            <input
              type="number"
              placeholder="Порядок"
              value={form.sortOrder}
              onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
              className="border p-2 rounded"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
              />
              Показувати в додатку
            </label>
          </div>

          <div
            className="rounded-2xl p-5 flex items-center justify-between text-white"
            style={{ backgroundColor: form.color }}
          >
            <div>
              <div className="text-xl font-bold">{form.title || 'Заголовок'}</div>
              <div className="opacity-90">{form.subtitle || 'Підзаголовок'}</div>
              <div className="mt-3 inline-block bg-white/15 px-4 py-2 rounded-full text-sm">
                {form.cta}
              </div>
            </div>
            <div className="text-5xl">
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt=""
                  className="h-20 w-20 object-contain"
                />
              ) : (
                form.emoji
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? 'Збереження...' : editingId ? 'Зберегти' : 'Додати акцію'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Скасувати
              </button>
            ) : null}
          </div>
        </form>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Банер</th>
                <th className="p-3">Перехід</th>
                <th className="p-3">Статус</th>
                <th className="p-3">Дії</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    Завантаження...
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    Акцій ще немає
                  </td>
                </tr>
              ) : (
                promotions.map(promotion => (
                  <tr key={promotion._id} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl text-2xl text-white"
                          style={{ backgroundColor: promotion.color }}
                        >
                          {promotion.imageUrl ? (
                            <img
                              src={promotion.imageUrl}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            promotion.emoji
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{promotion.title}</div>
                          <div className="text-gray-500">{promotion.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>{promotion.categoryTitle}</div>
                      <div className="text-gray-500 text-xs">
                        {promotion.linkType === 'on_sale' ? 'Зі знижкою' : 'Категорія'}
                        {promotion.subcategoryTitle ? ` · ${promotion.subcategoryTitle}` : ''}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => void toggleActive(promotion)}
                        className={`px-2 py-1 rounded text-xs ${
                          promotion.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {promotion.isActive ? 'Активна' : 'Вимкнена'}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(promotion)}
                          className="text-blue-600 hover:underline"
                        >
                          Редагувати
                        </button>
                        <button
                          type="button"
                          onClick={() => void deletePromotion(promotion)}
                          disabled={deletingId === promotion._id}
                          className="text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deletingId === promotion._id ? 'Видалення...' : 'Видалити'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminWrapper>
  );
}
