import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const auth = request.headers.get('Authorization');
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

  const response = await fetch(`${backendUrl}/pdf/${id}`, {
    headers: { Authorization: auth || '' },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
  }

  const pdfBlob = await response.blob();
  return new NextResponse(pdfBlob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume-${id}.pdf"`,
    },
  });
}
