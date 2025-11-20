import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /:code - Redirect to target URL and increment click count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find the link by code
    const link = await prisma.link.findUnique({
      where: { code },
    });

    // If link doesn't exist, return 404
    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Update click count and last clicked time
    await prisma.link.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        lastClicked: new Date(),
      },
    });

    // Perform 302 redirect to the target URL
    return NextResponse.redirect(link.targetUrl, { status: 302 });
  } catch (error) {
    console.error('Error during redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
