declare module 'homenet-plugin-flic' {
  import { IPluginLoader } from '@homenet/core';
  export function create(annotate: any): { FlicPluginLoader: new (...args: any[]) => IPluginLoader }
}
