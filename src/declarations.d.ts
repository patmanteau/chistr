declare module "progressbar.js" {
  export class Shape {
    constructor(container: string, options?: any);
    animate(progress: number, options?: any): never;
    set(progress: number): never;
    stop(): never;
    value(): number;
    setText(text: string): never;
    destroy(): never;
  }

  class Line extends Shape {}
  class Circle extends Shape {}
  class SemiCircle extends Shape {}
}
