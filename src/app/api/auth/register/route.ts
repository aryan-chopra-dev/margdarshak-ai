import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Upsert user profile into the SQLite database
    const profile = await prisma.profile.upsert({
      where: { email },
      update: { name: name || 'User' },
      create: { 
        email, 
        name: name || 'User',
        shortlistedUniversities: '[]',
        docsUploaded: '[]'
      },
    });

    console.log('\n--- 🟢 USER AUTHENTICATED & SAVED TO DB ---');
    console.log(`Name: ${profile.name}`);
    console.log(`Email: ${profile.email}`);
    console.log('----------------------------------------------------\n');

    return NextResponse.json({
      status: 'success',
      profile,
      message: 'Authentication successful and profile saved.',
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ status: 'error', message: 'Auth processing failed' }, { status: 500 });
  }
}

