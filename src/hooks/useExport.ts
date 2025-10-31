import { useCallback } from 'react';
import { DrawingState } from '../types/canvas';

interface ExportOptions {
  backgroundColor?: string;
  includeMetadata?: boolean;
}

export const useExport = () => {
  const exportAsPNG = useCallback((
    canvas: HTMLCanvasElement,
    drawingState: DrawingState,
    options: ExportOptions = {}
  ) => {
    const { backgroundColor = '#ffffff', includeMetadata = true } = options;
    
    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Calculate bounding box of all drawings
    const allPoints = [
      ...drawingState.strokes.flatMap(s => s.points),
      ...drawingState.shapes.flatMap(s => [s.startPoint, s.endPoint])
    ];

    if (allPoints.length === 0) {
      alert('Nothing to export. Please draw something first.');
      return;
    }

    const minX = Math.min(...allPoints.map(p => p.x)) - 50;
    const minY = Math.min(...allPoints.map(p => p.y)) - 50;
    const maxX = Math.max(...allPoints.map(p => p.x)) + 50;
    const maxY = Math.max(...allPoints.map(p => p.y)) + 50;
    
    const width = maxX - minX;
    const height = maxY - minY;

    // Set export canvas size
    exportCanvas.width = width;
    exportCanvas.height = height;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Render all content to export canvas
    ctx.save();
    ctx.translate(-minX, -minY);

    // Render strokes
    drawingState.strokes.forEach(stroke => {
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

    // Render shapes
    drawingState.shapes.forEach(shape => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      switch (shape.type) {
        case 'rectangle': {
          const x = Math.min(shape.startPoint.x, shape.endPoint.x);
          const y = Math.min(shape.startPoint.y, shape.endPoint.y);
          const shapeWidth = Math.abs(shape.endPoint.x - shape.startPoint.x);
          const shapeHeight = Math.abs(shape.endPoint.y - shape.startPoint.y);
          ctx.rect(x, y, shapeWidth, shapeHeight);
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

    // Render text elements
    drawingState.texts.forEach(text => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.fontSize}px ${text.fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillText(text.text, text.position.x, text.position.y);
    });

    ctx.restore();

    // Add metadata if requested
    if (includeMetadata) {
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(`Whiteboard Export - ${new Date().toLocaleString()}`, 10, height - 10);
    }

    // Download
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }, []);

  const exportAsSVG = useCallback((
    drawingState: DrawingState,
    options: ExportOptions = {}
  ) => {
    const { includeMetadata = true } = options;
    
    // Calculate bounding box
    const allPoints = [
      ...drawingState.strokes.flatMap(s => s.points),
      ...drawingState.shapes.flatMap(s => [s.startPoint, s.endPoint]),
      ...drawingState.texts.map(t => t.position)
    ];

    if (allPoints.length === 0) {
      alert('Nothing to export. Please draw something first.');
      return;
    }

    const minX = Math.min(...allPoints.map(p => p.x)) - 50;
    const minY = Math.min(...allPoints.map(p => p.y)) - 50;
    const maxX = Math.max(...allPoints.map(p => p.x)) + 50;
    const maxY = Math.max(...allPoints.map(p => p.y)) + 50;
    
    const width = maxX - minX;
    const height = maxY - minY;

    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}">
  <style>
    .stroke { fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .shape { fill: none; stroke-linecap: round; stroke-linejoin: round; }
  </style>
  
  <!-- Shapes -->
  ${drawingState.shapes.map(shape => {
    const commonAttrs = `class="shape" stroke="${shape.color}" stroke-width="${shape.strokeWidth}"`;
    
    switch (shape.type) {
      case 'rectangle': {
        const x = Math.min(shape.startPoint.x, shape.endPoint.x);
        const y = Math.min(shape.startPoint.y, shape.endPoint.y);
        const rectWidth = Math.abs(shape.endPoint.x - shape.startPoint.x);
        const rectHeight = Math.abs(shape.endPoint.y - shape.startPoint.y);
        return `  <rect ${commonAttrs} x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}" />`;
      }
      case 'circle': {
        const radius = Math.sqrt(
          Math.pow(shape.endPoint.x - shape.startPoint.x, 2) + 
          Math.pow(shape.endPoint.y - shape.startPoint.y, 2)
        );
        return `  <circle ${commonAttrs} cx="${shape.startPoint.x}" cy="${shape.startPoint.y}" r="${radius}" />`;
      }
      case 'line': {
        return `  <line ${commonAttrs} x1="${shape.startPoint.x}" y1="${shape.startPoint.y}" x2="${shape.endPoint.x}" y2="${shape.endPoint.y}" />`;
      }
      default:
        return '';
    }
  }).join('\n  ')}
  
  <!-- Strokes -->
  ${drawingState.strokes.map(stroke => {
    if (stroke.tool === 'eraser' || stroke.points.length < 2) return '';
    
    const pathData = stroke.points.reduce((path, point, index) => {
      return index === 0 ? `M ${point.x} ${point.y}` : `${path} Q ${point.x} ${point.y}`;
    }, '');
    
    return `  <path class="stroke" d="${pathData}" stroke="${stroke.color}" stroke-width="${stroke.width}" />`;
  }).join('\n  ')}
  
  <!-- Text Elements -->
  ${drawingState.texts.map(text => {
    return `  <text x="${text.position.x}" y="${text.position.y}" font-family="${text.fontFamily}" font-size="${text.fontSize}" fill="${text.color}">
    ${text.text.replace(/[<>&]/g, function(match) {
      const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;' };
      return entities[match as keyof typeof entities];
    })}
  </text>`;
  }).join('\n  ')}
  
  ${includeMetadata ? `
  <!-- Metadata -->
  <text x="${minX + 10}" y="${maxY - 10}" font-family="Arial" font-size="12" fill="#666">
    Whiteboard Export - ${new Date().toLocaleString()}
  </text>` : ''}
</svg>`;

    // Download SVG
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    exportAsPNG,
    exportAsSVG
  };
};