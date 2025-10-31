export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  tool: Tool;
  timestamp: number;
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  startPoint: Point;
  endPoint: Point;
  color: string;
  strokeWidth: number;
  timestamp: number;
}

export interface TextElement {
  id: string;
  position: Point;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  timestamp: number;
}

export type Tool = 'pen' | 'brush' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text';

export interface DrawingState {
  strokes: Stroke[];
  shapes: Shape[];
  texts: TextElement[];
  currentTool: Tool;
  color: string;
  brushSize: number;
  isDrawing: boolean;
  currentStroke?: Stroke;
  currentShape?: Shape;
  zoom: number;
  pan: Point;
}

export interface CanvasConfig {
  width: number;
  height: number;
  dpr: number;
}