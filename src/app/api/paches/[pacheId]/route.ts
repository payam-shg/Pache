
import { NextResponse } from 'next/server';
import type { PacheGroup, Member, Expense, Payment } from '@/types';
import { readPacheData, writePacheData } from '@/lib/file-data-utils';

interface UpdatePacheBody {
  members?: Member[];
  expenses?: Expense[];
  payments?: Payment[];
  name?: string;
}

// GET a specific pache by ID
export async function GET(request: Request, { params }: { params: { pacheId: string } }) {
  try {
    // Per Next.js recommendation for dynamic APIs, ensure params are "awaited" if necessary.
    // For route params, direct access is usually fine, but being explicit if issues arise.
    const awaitedParams = await params;
    const { pacheId } = awaitedParams;

    const data = await readPacheData();
    const pache = (data.paches || []).find(p => p.id === pacheId);

    if (!pache) {
      return NextResponse.json({ message: 'Pache not found' }, { status: 404 });
    }
    return NextResponse.json(pache);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to retrieve pache' }, { status: 500 });
  }
}

// PUT (Update) a specific pache by ID
export async function PUT(request: Request, { params }: { params: { pacheId: string } }) {
  try {
    const awaitedParams = await params;
    const { pacheId } = awaitedParams;
    const updates = await request.json() as UpdatePacheBody;

    const data = await readPacheData();
    let pacheFound = false;
    const updatedPaches = (data.paches || []).map(pache => {
      if (pache.id === pacheId) {
        pacheFound = true;
        // Only update fields that are provided in the request
        return {
          ...pache,
          name: updates.name !== undefined ? updates.name : pache.name,
          members: updates.members !== undefined ? updates.members : pache.members,
          expenses: updates.expenses !== undefined ? updates.expenses : pache.expenses,
          payments: updates.payments !== undefined ? updates.payments : pache.payments,
        };
      }
      return pache;
    });

    if (!pacheFound) {
      return NextResponse.json({ message: 'Pache not found for update' }, { status: 404 });
    }

    await writePacheData({ paches: updatedPaches });
    const updatedPache = updatedPaches.find(p => p.id === pacheId);
    return NextResponse.json(updatedPache);

  } catch (error: any) {
    console.error("Error in PUT /api/paches/[pacheId]:", error);
    return NextResponse.json({ message: error.message || 'Failed to update pache' }, { status: 500 });
  }
}

// DELETE a specific pache by ID
export async function DELETE(request: Request, { params }: { params: { pacheId: string } }) {
  try {
    // Await params as per Next.js recommendation for dynamic APIs if encountering warnings/errors.
    // If params is a plain object, await will resolve to the object itself.
    const awaitedParams = await params;
    const { pacheId } = awaitedParams;

    const data = await readPacheData();
    
    const initialLength = (data.paches || []).length;
    const updatedPaches = (data.paches || []).filter(p => p.id !== pacheId);

    if (updatedPaches.length === initialLength) {
      return NextResponse.json({ message: 'Pache not found for deletion' }, { status: 404 });
    }

    await writePacheData({ paches: updatedPaches });
    return NextResponse.json({ message: 'Pache deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to delete pache' }, { status: 500 });
  }
}

