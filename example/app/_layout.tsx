import { ExpoMsalProvider } from "expo-msal";
import React from "react";
import {Slot} from "expo-router"

export default function App() {
  return (
    <ExpoMsalProvider clientId={'08624b03-1aa6-40c4-8fb3-149c39026dff'} tenantId='551df04d-543a-4d61-955e-e4294c4cf950'>
      <Slot />
    </ExpoMsalProvider>
  );
}
