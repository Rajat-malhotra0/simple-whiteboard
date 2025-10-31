import React from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { useDrawingHistory } from './hooks/useDrawingHistory';
import { useExport } from './hooks/useExport';
import { DrawingState, Tool } from './types/canvas';
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

        {/* Instructions Overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm z-10">
          <div className="flex flex-wrap justify-center gap-4">
            <span>Left click + drag to draw</span>
            <span>Scroll to zoom</span>
            <span>Ctrl + click to pan</span>
            <span>Right-click not supported</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs">
          Tool: {state.currentTool} | Color: {state.color} | Size: {state.brushSize}px | Zoom: {Math.round(state.zoom * 100)}%
        </div>
      </div>
    </div>
  );
}

export default App;