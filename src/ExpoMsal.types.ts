export type ChangeEventPayload = {
  value: string;
};

export type ExpoMsalConfig = {
  clientId: string;
  scopes: string[];
  authority: string;
  redirectUri: string;
};

export enum ResultState {
  success,
  error
}

export type TokenResult = {
  result: ResultState,
  data: string //Error or token
}