type func = <T>(input: T[], comparator: (a: T, b: T) => number) => T | null;
type index<L> = <T>(input: T[], comparator: (a: T, b: T) => number) => L;
declare module 'stats' {
  export const getMaxIndex: index<number>;
  export const getMaxElement: func;
  export const getMinIndex: index<number>;
  export const getMinElement: func;
  export const getMedianIndex: index<number>;
  export const getMedianElement: func;
  export const getAverageValue: func;
}
