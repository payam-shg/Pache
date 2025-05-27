
import { NextResponse } from 'next/server';
import type { PacheGroup } from '@/types';
import { readPacheData, writePacheData } from '@/lib/file-data-utils';

// GET all paches
export async function GET() {
  try {
    const data = await readPacheData();
    return NextResponse.json(data.paches || []);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to retrieve paches' }, { status: 500 });
  }
}

// POST a new pache
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'Pache name is required and must be a non-empty string.' }, { status: 400 });
    }

    const data = await readPacheData();
    const newPache: PacheGroup = {
      id: crypto.randomUUID(),
      name: name.trim(),
      members: [],
      expenses: [],
      payments: [],
    };
    
    const updatedPaches = [...(data.paches || []), newPache];
    await writePacheData({ paches: updatedPaches });
    
    return NextResponse.json(newPache, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to create pache' }, { status: 500 });
  }
}
