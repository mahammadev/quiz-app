import { promises as fs } from 'fs';
import path from 'path';
import FlowViewer from './flow-viewer';

export default async function PageFlow() {
  const filePath = path.join(process.cwd(), 'flow.json');
  let flowData;

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    flowData = JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading flow.json:", error);
    return (
      <div className="p-10 text-destructive">
        Error loading flow data. Please ensure flow.json exists in the project root.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Application Interface Flow</h1>
      <div className="flex-1 min-h-0">
        <FlowViewer 
          initialNodes={flowData.nodes || []} 
          initialEdges={flowData.edges || []} 
        />
      </div>
    </div>
  );
}
