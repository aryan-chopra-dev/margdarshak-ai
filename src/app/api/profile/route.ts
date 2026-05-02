import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, ...updates } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Convert arrays to JSON strings if they are passed as arrays
    if (Array.isArray(updates.shortlistedUniversities)) {
      updates.shortlistedUniversities = JSON.stringify(updates.shortlistedUniversities);
    }
    if (Array.isArray(updates.docsUploaded)) {
      updates.docsUploaded = JSON.stringify(updates.docsUploaded);
    }

    const profile = await prisma.profile.update({
      where: { email },
      data: updates,
    });

    return NextResponse.json({
      status: 'success',
      profile,
    });

  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { email },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Parse JSON strings back to arrays
    const parsedProfile = {
      ...profile,
      shortlistedUniversities: JSON.parse(profile.shortlistedUniversities || '[]'),
      docsUploaded: JSON.parse(profile.docsUploaded || '[]'),
    };

    return NextResponse.json({
      status: 'success',
      profile: parsedProfile,
    });

  } catch (error) {
    console.error('Profile Fetch Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch profile' }, { status: 500 });
  }
}
