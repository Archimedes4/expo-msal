import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ExpoMsalViewProps } from './ExpoMsal.types';

const NativeView: React.ComponentType<ExpoMsalViewProps> =
  requireNativeViewManager('ExpoMsal');

export default function ExpoMsalView(props: ExpoMsalViewProps) {
  return <NativeView {...props} />;
}
