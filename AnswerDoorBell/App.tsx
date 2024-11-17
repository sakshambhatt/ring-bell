import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AuthForm from './src/components/organisms/AuthForm';
import AnswerDoor from './src/components/organisms/AnswerDoor';
import commonStyles from './src/styles/common';
import {useMMKVString} from 'react-native-mmkv';
import showToast from './src/utils/toasts';

function App(): React.JSX.Element {
  const [userId] = useMMKVString('userId');

  useEffect(() => {
    let ignore = false;

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

    if (!ignore && Platform.OS === 'android' && Platform.Version >= 33) {
      getPermissions();
    }

    return () => {
      ignore = true;
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
