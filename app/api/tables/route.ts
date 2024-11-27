import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const tablesDir = path.join(process.cwd(), 'public/tables');

  try {
    const files = fs.readdirSync(tablesDir).filter((file) => file.endsWith('.json'));
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error reading table directory:', error);
    return NextResponse.json({ error: 'Failed to list tables' }, { status: 500 });
  }
}
