import { loadTables } from '@/utils/loadtables';
import Fuse from 'fuse.js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query || query.trim() === '') {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }
 
  try {
    const allTables = await loadTables();

    // Fuse.js options
    const options = {
      keys: ['table', 'sub_tables', 'subtable_name', 'outcome', 'notes'],
      threshold: 0.3,
    };

    const fuse = new Fuse(allTables, options);
    const results = fuse.search(query);

    // Remove duplicates by keeping only unique table names
    const uniqueResults = Array.from(
        new Map(
            results.map((result) => [result.item.table, result.item])
        ).values()
        );

    return NextResponse.json(uniqueResults);
  } catch (error) {
    console.error('Error handling search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
