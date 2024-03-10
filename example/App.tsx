import { StyleSheet, Text, View } from 'react-native';

import * as ExpoMsal from 'expo-msal';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{ExpoMsal.hello()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
