import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FLOW_FILE = path.join(process.cwd(), 'flow.json');
const TASKS_FILE = path.join(process.cwd(), 'tasks.json');

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await fs.readFile(FLOW_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ nodes: [], edges: [] });
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    await fs.writeFile(FLOW_FILE, JSON.stringify({ ...body, last_updated: new Date().toISOString() }, null, 2));

    // Update TASKS_FILE to notify agent
    try {
      const tasksData = await fs.readFile(TASKS_FILE, 'utf-8');
      const tasksLedger = JSON.parse(tasksData);
      
      const flowUpdateTask = {
        id: `TASK-FLOW-${Date.now()}`,
        title: "Review Updated User Flow",
        status: "pending",
        priority: "high",
        history: [
          {
            role: "user",
            content: "I have updated the user flow map visually. Please review the changes in flow.json and adapt the implementation if needed.",
            time: new Date().toISOString()
          }
        ],
        affected_files: ["flow.json"]
      };

      tasksLedger.tasks.unshift(flowUpdateTask);
      await fs.writeFile(TASKS_FILE, JSON.stringify(tasksLedger, null, 2));
    } catch (e) {
      console.error('Failed to update tasks ledger with flow change', e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write flow' }, { status: 500 });
  }
}
