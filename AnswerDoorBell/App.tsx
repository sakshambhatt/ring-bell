import React, {useEffect} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useMMKVString} from 'react-native-mmkv';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import AuthForm from './src/components/organisms/AuthForm';
import AnswerDoor from './src/components/organisms/AnswerDoor';
import commonStyles from './src/styles/common';
import showToast from './src/utils/toasts';
import logEvent from './src/utils/logEvent';

function App(): React.JSX.Element {
  const [userId] = useMMKVString('userId');

  const getPermissions = async () => {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notifications Permission needed',
          message:
            'Answer Doorbell requires notifications permission to function properly.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: "Cancel (App won't work)",
          buttonPositive: 'OK',
        },
      );

      if (
        [
          PermissionsAndroid.RESULTS.DENIED,
          PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        ].includes(result)
      ) {
        showToast({
          type: 'error',
          text1: 'Notifications permission denied',
          text2: "App won't work without notifications",
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        text1: `Error: ${error}`,
        text2: 'Please restart application',
      });
    }
  };

  const showForegroundAlert = (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    Alert.alert(
      remoteMessage.notification?.title || 'Hello',
      remoteMessage.notification?.body || 'Please open the door...',
      [
        {
          text: 'OK',
          onPress: () =>
            logEvent({
              eventName: 'interactedWithNotif',
              attributes: {
                type: 'foreground',
                remoteMessage: JSON.stringify(remoteMessage),
              },
            }),
        },
      ],
    );
  };

  useEffect(() => {
    let ignore = false;

    if (!ignore && Platform.OS === 'android' && Platform.Version >= 33) {
      getPermissions();
    }

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      logEvent({
        eventName: 'notifReceived',
        attributes: {time: new Date().toUTCString(), type: 'foreground'},
      });

      showForegroundAlert(remoteMessage);
    });

    return () => {
      ignore = true;
      unsubscribe;
    };
  }, []);

  return (
    <SafeAreaView
      style={[commonStyles.backgroundStyle, commonStyles.safeAreaView]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={commonStyles.backgroundStyle}>
        {userId ? <AnswerDoor /> : <AuthForm />}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

export default App;
