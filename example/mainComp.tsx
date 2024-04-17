import { Button, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMSAL, ExpoMsalProvider, ResultState } from 'expo-msal';
import { useEffect, useState } from 'react';
import {useWindowDimensions} from 'react-native';


export default function MainComp({isAuth}:{isAuth: boolean}) {
  const {height, width} = useWindowDimensions();
  const [token, setToken] = useState<string>("NO TOKEN")
  const MSAL = useMSAL({
    clientId: 'd585b96d-aa24-4276-9d4f-a3538789a10e',
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
    if (result !== undefined && result.result === ResultState.success) {
      setToken(result.data) 
    }
  }
  async function getTokenInter() {
    setToken("This is updated 1")
    // On native retuns value, web no value to be returned
    const result = await MSAL.acquireTokenInteractively()
    console.log("HERE", result)
    if (result !== undefined && result.result === ResultState.success) {
      setToken(result.data)
    }
  }
  async function signOut() {
    // On native retuns value, web no value to be returned
    setToken("")
    console.log(await MSAL.signOut())
  }

  useEffect(() => {
    getToken()
  }, [])
  return (
    <ScrollView style={{height, width, backgroundColor: "black"}}>
      <View style={[styles.container, {height, width}]}>
        {isAuth ?
         <Text style={{color: "white"}}>This is auth tab</Text>:null
        }
        <Text style={{color: "white"}}>{token}</Text>
        <Button title='Login' onPress={() => {getTokenInter()}}/>
        <Button title='Get Silent' onPress={() => {getToken()}}/>
        <Button title='Logout' onPress={() => {signOut()}}/>
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center'
  },
});
