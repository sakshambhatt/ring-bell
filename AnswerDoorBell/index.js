/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
import logEvent from './src/utils/logEvent';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  logEvent({
    eventName: 'notifReceived',
    attributes: {
      time: new Date().toUTCString(),
      type: 'background',
      remoteMessage: JSON.stringify(remoteMessage),
    },
  });
});

AppRegistry.registerComponent(appName, () => App);
