export interface SlideshowState {
  isActive: boolean;
  timePerItem: number; // ms
  remainingTime: number; // para el contador visual
}