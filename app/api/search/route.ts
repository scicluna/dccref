import Fuse from 'fuse.js';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

export async function loadTables() {
  const tablesDir = path.join(process.cwd(), 'public', 'tables');

  try {
    // Read all files in the directory
    const files = await fs.readdir(tablesDir);

    // Filter JSON files
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    // Load and parse each JSON file
    const tables = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(tablesDir, file);
        const fileContent = await fs.readFile(filePath, 'utf8');

        // Skip empty files
        if (!fileContent.trim()) {
          console.warn(`Skipping empty file: ${file}`);
          return null;
        }

        try {
          const parsed = JSON.parse(fileContent);

          // Extract fields into a flat structure for search
          return {
            table: parsed.table_name,
            notes: parsed.notes,
            general: parsed.general,
            sub_tables: parsed.sub_tables?.map((sub: any) => ({
              subtable_name: sub.subtable_name,
              dice_size: sub.dice_size,
              table: sub.table,
            })),
          };
        } catch (jsonError) {
          console.warn(`Skipping malformed JSON file: ${file}`, jsonError);
          return null;
        }
      })
    );

    // Remove null entries caused by invalid or empty files
    return tables.filter((table) => table !== null);
  } catch (error) {
    console.error('Error loading tables:', error);
    throw new Error('Failed to load tables');
  }
}
