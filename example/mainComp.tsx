import { Button, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMSAL, ResultState } from 'expo-msal';
import { useEffect, useState } from 'react';
import {useWindowDimensions} from 'react-native';


export default function MainComp({isAuth}:{isAuth: boolean}) {
  const {height, width} = useWindowDimensions();
  const [token, setToken] = useState<string>("NO TOKEN")
  const MSAL = useMSAL({
    // @ts-expect-error
    clientId:  (process.env.EXPO_PUBLIC_CLIENTID) ?? "",
    authority: `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID}`,
    scopes: ["user.read"],
    redirectUri: Platform.select({
      ios: "msauth.expo.modules.msal.example://auth",
      android: "msauth://expo.modules.msal.example",
      default: ""
    })
  })

  async function getToken() {
    let result = await MSAL.acquireTokenSilently()
    console.log(result)
    if (result !== undefined && result.result === ResultState.success) {
      setToken(result.data) 
    }
  }

  async function getTokenInter() {
    setToken("Interactive Started")
    // On native retuns value, web no value to be returned
    const result = await MSAL.acquireTokenInteractively()
    if (result !== undefined && result.result === ResultState.success) {
      setToken(result.data)
    } else [
      setToken("Interaction Ended")
    ]
  }
  async function signOut() {
    // On native retuns value, web no value to be returned
    setToken("")
    const logoutResult = await MSAL.signOut()
    if (logoutResult) {
      setToken("Successfully Logged Out")
    } else {
      setToken("Something went wrong logging out.")
    }
  }

  useEffect(() => {
    getToken()
  }, [])

  return (
    <ScrollView style={{height, width, backgroundColor: "black"}}>
      <View style={[styles.container, {height, width}]}>
        <Text style={{color: "white"}}>{token}</Text>
        <Text style={{color: "white"}}>This is auth tab</Text>
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
