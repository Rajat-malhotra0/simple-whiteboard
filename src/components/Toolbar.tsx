import React from 'react';
import { 
  Pen, 
  Brush, 
  Eraser, 
  Square, 
  Circle, 
  Minus, 
  Type,
  Undo,
  Redo,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';
import { Tool } from '../types/canvas';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  color: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportPNG: () => void;
  onExportSVG: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
}

const colorPalette = [
  '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
  '#800080', '#FFC0CB', '#A52A2A', '#808080'
];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExportPNG,
  onExportSVG,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen
}) => {
  const tools = [
    { id: 'pen' as Tool, icon: Pen, label: 'Pen' },
    { id: 'brush' as Tool, icon: Brush, label: 'Brush' },
    { id: 'eraser' as Tool, icon: Eraser, label: 'Eraser' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'line' as Tool, icon: Minus, label: 'Line' },
    { id: 'text' as Tool, icon: Type, label: 'Text' }
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 text-white rounded-lg shadow-lg">
      {/* Drawing Tools */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Tools</h3>
        <div className="grid grid-cols-2 gap-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`p-2 rounded transition-colors ${
                  currentTool === tool.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
                title={tool.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Colors</h3>
        <div className="grid grid-cols-4 gap-1">
          {colorPalette.map((col) => (
            <button
              key={col}
              onClick={() => onColorChange(col)}
              className={`w-8 h-8 rounded border-2 transition-all ${
                color === col
                  ? 'border-white scale-110'
                  : 'border-gray-600 hover:scale-105'
              }`}
              style={{ backgroundColor: col }}
              title={col}
            />
          ))}
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-full h-8 rounded border border-gray-600 bg-transparent"
        />
      </div>

      {/* Brush Size */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Size</h3>
        <div className="space-y-1">
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1px</span>
            <span>{brushSize}px</span>
            <span>50px</span>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div
            className="rounded-full bg-gray-300"
            style={{
              width: Math.min(brushSize, 20),
              height: Math.min(brushSize, 20),
              minWidth: '4px',
              minHeight: '4px'
            }}
          />
        </div>
      </div>

      {/* History Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">History</h3>
        <div className="flex gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex-1 p-2 rounded transition-colors ${
              canUndo
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-900 text-gray-600 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <Undo size={20} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex-1 p-2 rounded transition-colors ${
              canRedo
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-900 text-gray-600 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <Redo size={20} />
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Zoom ({Math.round(zoom * 100)}%)</h3>
        <div className="flex gap-1">
          <button
            onClick={onZoomOut}
            className="flex-1 p-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={onFitToScreen}
            className="flex-1 p-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Fit to Screen"
          >
            <Maximize size={20} />
          </button>
          <button
            onClick={onZoomIn}
            className="flex-1 p-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      {/* Export Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Export</h3>
        <div className="space-y-1">
          <button
            onClick={onExportPNG}
            className="w-full p-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title="Export as PNG"
          >
            <Download size={16} className="inline mr-2" />
            PNG
          </button>
          <button
            onClick={onExportSVG}
            className="w-full p-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
            title="Export as SVG"
          >
            <Download size={16} className="inline mr-2" />
            SVG
          </button>
        </div>
      </div>
    </div>
  );
};