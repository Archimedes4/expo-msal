import * as React from 'react';

import { ExpoMsalViewProps } from './ExpoMsal.types';

export default function ExpoMsalView(props: ExpoMsalViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
