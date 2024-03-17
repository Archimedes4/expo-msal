export type ChangeEventPayload = {
  value: string;
};

export type ExpoMsalConfig = {
  clientId: string;
  scopes: string[];
  authority: string;
  redirectUri: string;
};