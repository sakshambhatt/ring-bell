/**
 * @format
 */

import {AppRegistry, Vibration} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
import logEvent from './src/utils/logEvent';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  // NOTE: Vibration doesn't work
  Vibration.vibrate([0, 400, 400, 800]);
  logEvent({
    eventName: 'notifReceived',
    attributes: {
      time: new Date().toUTCString(),
      type: 'background',
    },
  });
});

AppRegistry.registerComponent(appName, () => App);
