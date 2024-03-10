import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ExpoMsal.web.ts
// and on native platforms to ExpoMsal.ts
import ExpoMsalModule from './ExpoMsalModule';
import ExpoMsalView from './ExpoMsalView';
import { ChangeEventPayload, ExpoMsalViewProps } from './ExpoMsal.types';

// Get the native constant value.
export const PI = ExpoMsalModule.PI;

export function hello(): string {
  return ExpoMsalModule.hello();
}

export async function setValueAsync(value: string) {
  return await ExpoMsalModule.setValueAsync(value);
}

const emitter = new EventEmitter(ExpoMsalModule ?? NativeModulesProxy.ExpoMsal);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ExpoMsalView, ExpoMsalViewProps, ChangeEventPayload };
