import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import WebViewAuth0 from './WebViewAuth0';



export default class App extends React.Component {
  constructor() {
    super();
    this.webViewAuth0 = null;
    this.state = {
      messageDelta: {}
    };
  }

  render() {
    return (
      <View
        style={{
             ...StyleSheet.absoluteFillObject,
             padding: 5,
             marginTop: 15             
        }}
      >
        <Text>react-native-webview-auth0</Text>
        <View
          style={{
            flex: 1
          }}
        >
          <WebViewAuth0
            ref={component => (this.webViewAuth0 = component)}

          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
