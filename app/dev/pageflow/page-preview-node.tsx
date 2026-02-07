import { Handle, Position, NodeProps } from '@xyflow/react';

export default function PagePreviewNode({ data }: NodeProps) {
  return (
    <div className="border-2 border-primary rounded-md overflow-hidden bg-background shadow-md w-[400px] h-[300px] flex flex-col">
      <div className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold flex justify-between items-center">
        <span>{data.label as string}</span>
        <span className="opacity-75">{data.route as string}</span>
      </div>
      <div className="flex-1 relative bg-white">
        <iframe 
          src={data.route as string} 
          className="w-[200%] h-[200%] border-none absolute top-0 left-0 origin-top-left scale-50"
          style={{ pointerEvents: 'none' }} // Disable interaction to allow panning map
          title={`Preview of ${data.label}`}
        />
      </div>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
    </div>
  );
}
