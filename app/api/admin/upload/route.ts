import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { saveImage, UploadError } from '@/lib/mediaUpload';

/** Завантаження фото з компʼютера/телефона: до 10 файлів за раз */
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  try {
    const form = await req.formData();
    const files = form.getAll('files').concat(form.getAll('file')).filter((f): f is File => f instanceof File).slice(0, 10);
    if (!files.length) return NextResponse.json({ error: 'Оберіть фото' }, { status: 400 });

    const uploaded: Awaited<ReturnType<typeof saveImage>>[] = [];
    for (const file of files) uploaded.push(await saveImage(file));
    return NextResponse.json({ files: uploaded });
  } catch (error) {
    if (error instanceof UploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('POST /api/admin/upload failed:', error);
    return NextResponse.json({ error: 'Не вдалося завантажити фото' }, { status: 500 });
  }
}
