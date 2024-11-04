import React from 'react';
import {SafeAreaView, ScrollView} from 'react-native';
import Toast from 'react-native-toast-message';
import AuthForm from './src/components/organisms/AuthForm';
import AnswerDoor from './src/components/organisms/AnswerDoor';
import commonStyles from './src/styles/common';
import {useMMKVString} from 'react-native-mmkv';

function App(): React.JSX.Element {
  const [userId] = useMMKVString('userId');

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
