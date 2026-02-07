import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'tasks.json');

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('file');

  if (filePath) {
    try {
      // Security: ensure the path is within the project and doesn't use ..
      if (filePath.includes('..')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      const fullPath = path.join(process.cwd(), filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return NextResponse.json({ content });
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  }

  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    await fs.writeFile(TASKS_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write tasks' }, { status: 500 });
  }
}
