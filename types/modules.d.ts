// types/modules.d.ts
declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: ('square' | 'circle' | 'star')[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: ConfettiOptions): Promise<null> | null;
  export default confetti;
}

declare module 'ws' {
  export class WebSocketServer {
    constructor(options?: any);
    on(event: string, cb: (...args: any[]) => void): void;
    close(cb?: () => void): void;
  }
  export class WebSocket {
    static OPEN: number;
    readyState: number;
    send(data: any): void;
    on(event: string, cb: (...args: any[]) => void): void;
  }
}
