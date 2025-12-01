// Minimal ambient d3 types to satisfy typedRoutes in Next build for the embedded game.
declare module "d3" {
  export function select(el: Element): any;
  export function line<T>(): {
    x(fn: (d: T) => number): ReturnType<typeof line<T>>;
    y(fn: (d: T) => number): ReturnType<typeof line<T>>;
    curve(fn: any): ReturnType<typeof line<T>>;
  };

  export const curveCatmullRom: {
    alpha(n: number): any;
  };
}
