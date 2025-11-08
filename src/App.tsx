import React from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { useDrawingHistory } from './hooks/useDrawingHistory';
import { useExport } from './hooks/useExport';
import { DrawingState, Tool } from './types/canvas';
import { Info } from 'lucide-react';
import './App.css';

const initialState: DrawingState = {
  strokes: [],
  shapes: [],
  texts: [],
  currentTool: 'pen',
  color: '#000000',
  brushSize: 5,
  isDrawing: false,
  zoom: 1,
  pan: { x: 0, y: 0 }
};

function App() {
  const { state, updateState, undo, redo, canUndo, canRedo } = useDrawingHistory(initialState);
  const { exportAsPNG, exportAsSVG } = useExport();

  const handleToolChange = (tool: Tool) => {
    updateState({ ...state, currentTool: tool });
  };

  const handleColorChange = (color: string) => {
    updateState({ ...state, color });
  };

  const handleBrushSizeChange = (size: number) => {
    updateState({ ...state, brushSize: size });
  };

  const handleZoomIn = () => {
    updateState({
      ...state,
      zoom: Math.min(5, state.zoom * 1.2)
    });
  };

  const handleZoomOut = () => {
    updateState({
      ...state,
      zoom: Math.max(0.1, state.zoom * 0.8)
    });
  };

  const handleFitToScreen = () => {
    updateState({
      ...state,
      zoom: 1,
      pan: { x: 0, y: 0 }
    });
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportAsPNG(canvas, state);
    }
  };

  const handleExportSVG = () => {
    exportAsSVG(state);
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Toolbar */}
      <div className="w-80 p-4 bg-gray-200 overflow-y-auto">
        <Toolbar
          currentTool={state.currentTool}
          onToolChange={handleToolChange}
          color={state.color}
          onColorChange={handleColorChange}
          brushSize={state.brushSize}
          onBrushSizeChange={handleBrushSizeChange}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onExportPNG={handleExportPNG}
          onExportSVG={handleExportSVG}
          zoom={state.zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToScreen={handleFitToScreen}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <Canvas
            drawingState={state}
            onStateChange={updateState}
            className="w-full h-full cursor-crosshair bg-white"
          />
        </div>

        {/* Info Button with Hover Tooltip */}
        <div className="absolute top-4 right-4 z-10 group">
          <button className="border-2 border-black text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-black hover:bg-opacity-10 transition-all font-serif font-bold text-2xl">
            i
          </button>
          
          {/* Tooltip - appears on hover */}
          <div className="absolute right-0 top-12 bg-black bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64">
            <div className="space-y-2">
              <div className="font-semibold mb-2 border-b border-gray-500 pb-2">Controls</div>
              <div>• Left click + drag to draw</div>
              <div>• Scroll to zoom</div>
              <div>• Shift/Ctrl/Right-click to pan</div>
              <div className="font-semibold mt-3 mb-2 border-b border-gray-500 pb-2">Current Settings</div>
              <div>• Tool: <span className="font-mono">{state.currentTool}</span></div>
              <div>• Color: <span className="font-mono">{state.color}</span></div>
              <div>• Size: <span className="font-mono">{state.brushSize}px</span></div>
              <div>• Zoom: <span className="font-mono">{Math.round(state.zoom * 100)}%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;