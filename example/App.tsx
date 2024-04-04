import { Button, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMSAL, ExpoMsalProvider } from 'expo-msal';
import { useEffect, useState } from 'react';

export function Content() {
  const [token, setToken] = useState<string>("NO TOKEN")
  const MSAL = useMSAL({
    clientId: '08624b03-1aa6-40c4-8fb3-149c39026dff',
    authority: 'https://login.microsoftonline.com/551df04d-543a-4d61-955e-e4294c4cf950',
    scopes: ["user.read"],
    redirectUri: Platform.select({
      ios: "msauth.expo.modules.msal.example://auth",
      android: "msauth://expo.modules.msal.example",
      default: ""
    })
  })
  async function getToken() {
    let result = await MSAL.acquireTokenSilently()
    console.log(result.data)
    console.log(result.result)
    setToken(result.data)
  }
  async function getTokenInter() {
    setToken("This is updated 1")
    // On native retuns value, web no value to be returned
    setToken((await MSAL.acquireTokenInteractively()).data)
  }
  async function signOut() {
    // On native retuns value, web no value to be returned
    console.log(await MSAL.signOut())
  }

  useEffect(() => {
    getToken()
  }, [])
  return (
    <ScrollView>
      <View style={styles.container}>
      <Text style={{color: "white"}}>{token}</Text>
      <Button title='Login' onPress={() => {getTokenInter()}}/>
      <Button title='Get Silent' onPress={() => {getToken()}}/>
      <Button title='Logout' onPress={() => {signOut()}}/>
      </View>
    </ScrollView>
  )
}

export default function App() {
  return (
    <ExpoMsalProvider>
      <Content />
    </ExpoMsalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
