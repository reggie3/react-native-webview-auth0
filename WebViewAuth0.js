import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  WebView,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';
import renderIf from 'render-if';
import { RkButton, RkTheme } from 'react-native-ui-kitten';
import * as webViewDownloadHelper from './webViewDownloadHelper';
import { FileSystem } from 'expo';

import * as config from './config';

// path to the file that the webview will load
const INDEX_FILE_PATH = `${FileSystem.documentDirectory}${
    config.PACKAGE_NAME
  }/${config.PACKAGE_VERSION}/auth0React-index.html`;
  // the files that will be downloaded
  const FILES_TO_DOWNLOAD = [

  ];
  
  const MESSAGE_PREFIX = 'react-native-webview-auth0';

  export default class WebViewAuth0 extends React.Component {
    constructor() {
      super();
      this.state = {
        webViewNotLoaded: true, // flag to show activity indicator
        webViewFilesNotAvailable: true
      };
    }
    componentDidMount() {
        if(!config.USE_LOCAL_FILES){
      this.downloadWebViewFiles(FILES_TO_DOWNLOAD);
    }
    }
  
    downloadWebViewFiles = async filesToDownload => {
      if (!config.USE_LOCAL_FILES) {
        let downloadStatus = await webViewDownloadHelper.checkForFiles(
          config.PACKAGE_NAME,
          config.PACKAGE_VERSION,
          filesToDownload,
          this.webViewDownloadStatusCallBack
        );
        if (downloadStatus.success) {
          this.setState({ webViewFilesNotAvailable: false });
        } else if (!downloadStatus.success) {
          console.log(
            `unable to download html files: ${JSON.stringify(downloadStatus)}`
          );
          Alert.alert(
            'Error',
            `unable to download html files: ${JSON.stringify(downloadStatus)}`,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
            { cancelable: false }
          );
        } else {
          this.setState({ webViewFilesNotAvailable: false });
        }
      } else {
        this.setState({ webViewFilesNotAvailable: false });
      }
    };
  
    createWebViewRef = webview => {
      this.webview = webview;
    };
  
    handleMessage = event => {
      let msgData;
      try {
        msgData = JSON.parse(event.nativeEvent.data);
        if (
          msgData.hasOwnProperty('prefix') &&
          msgData.prefix === MESSAGE_PREFIX
        ) {
          console.log(`WebViewAuth0: received message ${msgData.type}`);
          this.sendMessage('MESSAGE_ACKNOWLEDGED');
          console.log(`WebViewAuth0: sent MESSAGE_ACKNOWLEDGED`);
  
          switch (msgData.type) {
            case 'EDITOR_MOUNTED':
              this.setState({ webViewNotLoaded: false });
              break;
            case 'RECEIVE_DELTA':
              this.props.getDeltaCallback(msgData.payload.delta);
              break;
            default:
              console.warn(
                `WebViewAuth0 Error: Unhandled message type received "${
                  msgData.type
                }"`
              );
          }
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    };
  
    webViewLoaded = () => {
      this.setState({ webViewNotLoaded: false });
      // send the content to the editor if we have it
     
    };
  
    sendMessage = (type, payload) => {
      // only send message when webview is loaded
      if (this.webview) {
        console.log(`WebViewAuth0: sending message ${type}`);
        this.webview.postMessage(
          JSON.stringify({
            prefix: MESSAGE_PREFIX,
            type,
            payload
          }),
          '*'
        );
      }
    };
  

  
    render = () => {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: '#ffebba'
          }}
        >
          {renderIf(this.state.webViewFilesNotAvailable)(
            <View style={styles.activityOverlayStyle}>
              <View style={styles.activityIndicatorContainer}>
                <ActivityIndicator
                  size="large"
                  animating={this.state.webViewFilesNotAvailable}
                  color="blue"
                />
              </View>
            </View>
          )}
          {renderIf(!this.state.webViewFilesNotAvailable)(
            <WebView
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: '#ffebba',
                padding: 10
              }}
              ref={this.createWebViewRef}
              source={
                config.USE_LOCAL_FILES
                  ? require('./dist/auth0React-index.html')
                  : { uri: INDEX_FILE_PATH }
              }
              onLoadEnd={this.webViewLoaded}
              onMessage={this.handleMessage}
            />
          )}
          {renderIf(
            this.state.webViewNotLoaded && !this.state.webViewFilesNotAvailable
          )(
            <View style={styles.activityOverlayStyle}>
              <View style={styles.activityIndicatorContainer}>
                <ActivityIndicator
                  size="large"
                  animating={this.state.webViewNotLoaded}
                  color="orange"
                />
              </View>
            </View>
          )}
        </View>
      );
    };
  }
  
  WebViewAuth0.propTypes = {
 
  };
  
  const styles = StyleSheet.create({
    activityOverlayStyle: {
      ...StyleSheet.absoluteFillObject,
      marginHorizontal: 20,
      marginVertical: 60,
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      borderRadius: 5
    },
    activityIndicatorContainer: {
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 50,
      alignSelf: 'center',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowRadius: 5,
      shadowOpacity: 1.0
    }
  });