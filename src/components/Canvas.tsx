import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Point, Stroke, Shape, TextElement, Tool, DrawingState, CanvasConfig } from '../types/canvas';

interface CanvasProps {
  drawingState: DrawingState;
  onStateChange: (state: DrawingState) => void;
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ drawingState, onStateChange, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({ width: 0, height: 0, dpr: 1 });
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);
  const [textInputRef, setTextInputRef] = useState<HTMLInputElement | null>(null);

  // Initialize canvas with high-DPI support
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set the display size (css pixels)
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Set the actual size in memory (scaled to avoid blurriness)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Set the canvas to scale properly
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;
    }

    setCanvasConfig({ width: rect.width, height: rect.height, dpr });
  }, []);

  // Draw grid background
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const { zoom, pan } = drawingState;
    const { width, height } = canvasConfig;
    
    // Calculate visible area in world coordinates
    const visibleStartX = pan.x;
    const visibleStartY = pan.y;
    const visibleEndX = pan.x + width / zoom;
    const visibleEndY = pan.y + height / zoom;
    
    // Adaptive grid spacing based on zoom level
    // When zoomed out, increase grid spacing to reduce line count
    let minorGridSize = 20;
    let majorGridSize = 100;
    
    // Scale grid size when zoomed out to maintain performance
    if (zoom < 0.5) {
      minorGridSize = 100;
      majorGridSize = 500;
    } else if (zoom < 0.75) {
      minorGridSize = 50;
      majorGridSize = 200;
    }
    
    // Limit the number of grid lines to prevent performance issues
    const maxLinesPerAxis = 100;
    const visibleWidth = visibleEndX - visibleStartX;
    const visibleHeight = visibleEndY - visibleStartY;
    
    // Adjust grid size if there would be too many lines
    while (visibleWidth / minorGridSize > maxLinesPerAxis || visibleHeight / minorGridSize > maxLinesPerAxis) {
      minorGridSize *= 2;
      majorGridSize *= 2;
    }
    
    // Calculate starting grid lines
    const startX = Math.floor(visibleStartX / minorGridSize) * minorGridSize;
    const startY = Math.floor(visibleStartY / minorGridSize) * minorGridSize;
    const endX = Math.ceil(visibleEndX / minorGridSize) * minorGridSize;
    const endY = Math.ceil(visibleEndY / minorGridSize) * minorGridSize;
    
    // Save context state
    ctx.save();
    
    // Only draw minor grid when zoomed in enough to see them clearly
    if (zoom >= 0.5) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1 / zoom;
      ctx.lineCap = 'butt';
      
      // Use beginPath once and moveTo/lineTo for better performance
      ctx.beginPath();
      
      // Draw vertical minor grid lines
      for (let x = startX; x <= endX; x += minorGridSize) {
        if (Math.abs(x % majorGridSize) < 0.001) continue;
        ctx.moveTo(x, visibleStartY);
        ctx.lineTo(x, visibleEndY);
      }
      
      // Draw horizontal minor grid lines
      for (let y = startY; y <= endY; y += minorGridSize) {
        if (Math.abs(y % majorGridSize) < 0.001) continue;
        ctx.moveTo(visibleStartX, y);
        ctx.lineTo(visibleEndX, y);
      }
      
      ctx.stroke();
    }
    
    // Draw major grid lines (always visible)
    ctx.strokeStyle = '#e0e0e0';
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1.5 / zoom;
    ctx.lineCap = 'butt';
    
    ctx.beginPath();
    
    // Draw vertical major grid lines
    for (let x = Math.floor(visibleStartX / majorGridSize) * majorGridSize; x <= visibleEndX; x += majorGridSize) {
      ctx.moveTo(x, visibleStartY);
      ctx.lineTo(x, visibleEndY);
    }
    
    // Draw horizontal major grid lines
    for (let y = Math.floor(visibleStartY / majorGridSize) * majorGridSize; y <= visibleEndY; y += majorGridSize) {
      ctx.moveTo(visibleStartX, y);
      ctx.lineTo(visibleEndX, y);
    }
    
    ctx.stroke();
    
    // Restore context state
    ctx.restore();
  }, [drawingState, canvasConfig]);

  // Get canvas coordinates from mouse/touch event
  const getCanvasPoint = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / drawingState.zoom + drawingState.pan.x,
      y: (clientY - rect.top) / drawingState.zoom + drawingState.pan.y
    };
  }, [drawingState.zoom, drawingState.pan]);

  // Start drawing based on current tool
  const startDrawing = useCallback((point: Point) => {
    const newState = { ...drawingState, isDrawing: true };

    switch (drawingState.currentTool) {
      case 'pen':
      case 'brush':
      case 'eraser': {
        const newStroke: Stroke = {
          id: `stroke_${Date.now()}_${Math.random()}`,
          points: [point],
          color: drawingState.currentTool === 'eraser' ? '#ffffff' : drawingState.color,
          width: drawingState.brushSize,
          tool: drawingState.currentTool,
          timestamp: Date.now()
        };
        newState.currentStroke = newStroke;
        break;
      }
      case 'rectangle':
      case 'circle':
      case 'line': {
        const newShape: Shape = {
          id: `shape_${Date.now()}_${Math.random()}`,
          type: drawingState.currentTool,
          startPoint: point,
          endPoint: point,
          color: drawingState.color,
          strokeWidth: drawingState.brushSize,
          timestamp: Date.now()
        };
        newState.currentShape = newShape;
        break;
      }
      case 'text': {
        // Set up text input at the click position
        setTextInput({
          x: point.x,
          y: point.y,
          value: ''
        });
        break;
      }
    }

    onStateChange(newState);
  }, [drawingState, onStateChange]);

  // Continue drawing
  const continueDrawing = useCallback((point: Point) => {
    if (!drawingState.isDrawing) return;

    const newState = { ...drawingState };

    if (newState.currentStroke) {
      newState.currentStroke.points.push(point);
    } else if (newState.currentShape) {
      newState.currentShape.endPoint = point;
    }

    onStateChange(newState);
  }, [drawingState, onStateChange]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    const newState = { ...drawingState, isDrawing: false };

    if (newState.currentStroke) {
      newState.strokes.push(newState.currentStroke);
      newState.currentStroke = undefined;
    } else if (newState.currentShape) {
      newState.shapes.push(newState.currentShape);
      newState.currentShape = undefined;
    }

    onStateChange(newState);
  }, [drawingState, onStateChange]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e.clientX, e.clientY);
    
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.ctrlKey) || (e.button === 0 && e.shiftKey)) {
      // Middle mouse, right mouse, Ctrl+Left mouse, or Shift+Left mouse for panning
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      startDrawing(point);
    }
  }, [getCanvasPoint, startDrawing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      // Use screen coordinates for panning to avoid zoom/pan calculation issues
      const deltaX = (e.clientX - dragStart.x) / drawingState.zoom;
      const deltaY = (e.clientY - dragStart.y) / drawingState.zoom;
      
      onStateChange({
        ...drawingState,
        pan: {
          x: drawingState.pan.x - deltaX,
          y: drawingState.pan.y - deltaY
        }
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      const point = getCanvasPoint(e.clientX, e.clientY);
      continueDrawing(point);
    }
  }, [getCanvasPoint, continueDrawing, isDragging, dragStart, drawingState, onStateChange]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    } else {
      stopDrawing();
    }
  }, [isDragging, stopDrawing]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    startDrawing(point);
  }, [getCanvasPoint, startDrawing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    continueDrawing(point);
  }, [getCanvasPoint, continueDrawing]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    stopDrawing();
  }, [stopDrawing]);

  // Zoom functionality
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mousePoint = getCanvasPoint(e.clientX, e.clientY);
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, drawingState.zoom * zoomFactor));
    
    // Adjust pan to zoom towards mouse position
    const panX = mousePoint.x - (mousePoint.x - drawingState.pan.x) * (newZoom / drawingState.zoom);
    const panY = mousePoint.y - (mousePoint.y - drawingState.pan.y) * (newZoom / drawingState.zoom);
    
    onStateChange({
      ...drawingState,
      zoom: newZoom,
      pan: { x: panX, y: panY }
    });
  }, [drawingState, getCanvasPoint, onStateChange]);

  // Render canvas content
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasConfig.width, canvasConfig.height);
    
    // Save context for transforms
    ctx.save();
    
    // Apply zoom and pan transforms
    ctx.scale(drawingState.zoom, drawingState.zoom);
    ctx.translate(-drawingState.pan.x, -drawingState.pan.y);
    
    // Draw grid background first (behind all other elements)
    drawGrid(ctx);
    
    // Render all strokes
    [...drawingState.strokes, ...(drawingState.currentStroke ? [drawingState.currentStroke] : [])].forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.width;
      ctx.strokeStyle = stroke.color;
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        const prev = stroke.points[i - 1];
        const curr = stroke.points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }
      
      ctx.stroke();
    });
    
    // Render all shapes
    [...drawingState.shapes, ...(drawingState.currentShape ? [drawingState.currentShape] : [])].forEach(shape => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      switch (shape.type) {
        case 'rectangle': {
          const x = Math.min(shape.startPoint.x, shape.endPoint.x);
          const y = Math.min(shape.startPoint.y, shape.endPoint.y);
          const width = Math.abs(shape.endPoint.x - shape.startPoint.x);
          const height = Math.abs(shape.endPoint.y - shape.startPoint.y);
          ctx.rect(x, y, width, height);
          break;
        }
        case 'circle': {
          const radius = Math.sqrt(
            Math.pow(shape.endPoint.x - shape.startPoint.x, 2) + 
            Math.pow(shape.endPoint.y - shape.startPoint.y, 2)
          );
          ctx.arc(shape.startPoint.x, shape.startPoint.y, radius, 0, 2 * Math.PI);
          break;
        }
        case 'line': {
          ctx.moveTo(shape.startPoint.x, shape.startPoint.y);
          ctx.lineTo(shape.endPoint.x, shape.endPoint.y);
          break;
        }
      }
      
      ctx.stroke();
    });

    // Render all text elements
    drawingState.texts.forEach(text => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.fontSize}px ${text.fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillText(text.text, text.position.x, text.position.y);
    });
    
    // Restore context
    ctx.restore();
  }, [drawingState, canvasConfig, drawGrid]);

  // Handle text input submission
  const handleTextInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (textInput) {
      setTextInput({ ...textInput, value: e.target.value });
    }
  }, [textInput]);

  const handleTextInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (textInput && textInput.value.trim()) {
        const newText: TextElement = {
          id: `text_${Date.now()}_${Math.random()}`,
          position: { x: textInput.x, y: textInput.y },
          text: textInput.value.trim(),
          color: drawingState.color,
          fontSize: Math.max(12, drawingState.brushSize * 2),
          fontFamily: 'Arial, sans-serif',
          timestamp: Date.now()
        };
        
        const newState = { ...drawingState, texts: [...drawingState.texts, newText] };
        onStateChange(newState);
      }
      setTextInput(null);
    } else if (e.key === 'Escape') {
      setTextInput(null);
    }
  }, [textInput, drawingState.color, drawingState.brushSize, drawingState.texts, onStateChange]);

  const handleTextInputBlur = useCallback(() => {
    if (textInput && textInput.value.trim()) {
      const newText: TextElement = {
        id: `text_${Date.now()}_${Math.random()}`,
        position: { x: textInput.x, y: textInput.y },
        text: textInput.value.trim(),
        color: drawingState.color,
        fontSize: Math.max(12, drawingState.brushSize * 2),
        fontFamily: 'Arial, sans-serif',
        timestamp: Date.now()
      };
      
      const newState = { ...drawingState, texts: [...drawingState.texts, newText] };
      onStateChange(newState);
    }
    setTextInput(null);
  }, [textInput, drawingState.color, drawingState.brushSize, drawingState.texts, onStateChange]);

  // Focus text input when it appears
  useEffect(() => {
    if (textInput && textInputRef) {
      textInputRef.focus();
    }
  }, [textInput, textInputRef]);

  // Initialize canvas and setup resize observer
  useEffect(() => {
    initCanvas();
    
    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
    });
    
    const canvas = canvasRef.current;
    if (canvas) {
      resizeObserver.observe(canvas);
    }
    
    return () => resizeObserver.disconnect();
  }, [initCanvas]);

  // Re-render canvas when state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
      />
      
      {/* Text Input Overlay */}
      {textInput && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: (textInput.x + drawingState.pan.x) * drawingState.zoom + 20,
            top: (textInput.y + drawingState.pan.y) * drawingState.zoom + 20,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <input
            ref={setTextInputRef}
            type="text"
            value={textInput.value}
            onChange={handleTextInputChange}
            onKeyDown={handleTextInputKeyDown}
            onBlur={handleTextInputBlur}
            className="bg-white border border-gray-400 px-2 py-1 text-lg outline-none pointer-events-auto"
            style={{
              fontSize: `${Math.max(12, drawingState.brushSize * 2)}px`,
              fontFamily: 'Arial, sans-serif',
              color: drawingState.color
            }}
            placeholder="Type and press Enter..."
          />
        </div>
      )}
    </>
  );
};