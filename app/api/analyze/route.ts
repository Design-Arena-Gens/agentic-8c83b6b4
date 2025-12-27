import { NextRequest, NextResponse } from 'next/server';
import { analyzeBooks } from '@/lib/analyzer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const queryValue = formData.get('query');
    if (typeof queryValue !== 'string' || queryValue.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const files = formData.getAll('files');
    if (files.length === 0) {
      return NextResponse.json({ error: 'At least one PDF file is required.' }, { status: 400 });
    }

    const pdfFiles: { buffer: Buffer; name: string }[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }
      if (file.type !== 'application/pdf') {
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      pdfFiles.push({
        name: file.name,
        buffer: Buffer.from(arrayBuffer)
      });
    }

    if (pdfFiles.length === 0) {
      return NextResponse.json({ error: 'No valid PDF files provided.' }, { status: 400 });
    }

    const results = await analyzeBooks(pdfFiles, queryValue);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Failed to analyze PDFs', error);
    return NextResponse.json({ error: 'Failed to analyze PDFs.' }, { status: 500 });
  }
}
