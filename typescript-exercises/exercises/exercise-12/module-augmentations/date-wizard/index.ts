// This enabled module augmentation mode.
import 'date-wizard';

declare module 'date-wizard' {
  // Add your module extensions here.
  export function pad<T>(name: T): T;
  export function dateDetails<T>(name: T): { hours: number };
}
