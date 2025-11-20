import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Helper function to validate code format (6-8 alphanumeric characters)
function isValidCode(code: string): boolean {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

// Helper function to generate random code
function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/links - List all links
export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(links, { status: 200 });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUrl, code: customCode } = body;

    // Validate target URL
    if (!targetUrl || typeof targetUrl !== 'string') {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(targetUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Determine the code to use
    let code = customCode;

    if (customCode) {
      // Validate custom code format
      if (!isValidCode(customCode)) {
        return NextResponse.json(
          { error: 'Custom code must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }

      // Check if custom code already exists
      const existingLink = await prisma.link.findUnique({
        where: { code: customCode },
      });

      if (existingLink) {
        return NextResponse.json(
          { error: 'This short code is already taken' },
          { status: 409 }
        );
      }
    } else {
      // Generate random code until we find one that doesn't exist
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        code = generateRandomCode();
        const existingLink = await prisma.link.findUnique({
          where: { code },
        });

        if (!existingLink) {
          break;
        }
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: 'Failed to generate unique code. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        code: code as string,
        targetUrl,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}
