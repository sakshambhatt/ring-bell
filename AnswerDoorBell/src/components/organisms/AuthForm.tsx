import {Text, StyleSheet, SafeAreaView, View, TextInput} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import {FIREBASE_ENDPOINT, CLIENT_APP_API_KEY} from '@env';

import commonStyles from '../../styles/common';
import showToast from '../../utils/toasts';
import useMmkv from '../../hooks/useMmkv';
import AsyncButton from '../atoms/AsyncButton';
import useApiStatus from '../../hooks/useApiStatus';
import logEvent from '../../utils/logEvent';

export default function AuthForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const fcmTokenRef = useRef<any>(null);

  const [isInputErrorVisible, setIsInputErrorVisible] = useState(false);

  const storage = useMmkv();
  const {apiStatus, setApiStatus} = useApiStatus();

  useEffect(() => {
    let ignore = false;

    const getFcmToken = async () => {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      return token;
    };

    if (!ignore) {
      const token = getFcmToken();
      fcmTokenRef.current = token;

      if (!ignore) {
        logEvent({eventName: 'appOpened', attributes: {}});
      }
    }

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async () => {
    const isFirstNameValid = firstName.length > 1;
    if (!isFirstNameValid) {
      setIsInputErrorVisible(true);
    } else {
      const lastNameToSubmit = lastName.length > 0 ? lastName : '.';

      setApiStatus(prev => ({...prev, isLoading: true}));
      try {
        const res = await axios.post(
          `${FIREBASE_ENDPOINT}/applyAsGateKeeper`,
          {
            firstName,
            lastName: lastNameToSubmit,
            token: fcmTokenRef.current._j,
          },
          {
            headers: {
              'x-api-key': CLIENT_APP_API_KEY,
            },
          },
        );
        const {data} = res;
        if (data.success) {
          const userId = data.id;
          storage.set('userId', userId);
        }
        setApiStatus(prev => ({...prev, isSuccess: true}));
        showToast({
          type: 'success',
          text1: 'Applied successfully as a gatekeeper',
          text2: null,
        });
      } catch (error) {
        setApiStatus(prev => ({...prev, isError: true}));
        showToast({
          type: 'error',
          text1: 'Failed to apply as a gatekeeper',
          text2: 'Please try again later',
        });
      } finally {
        setApiStatus(prev => ({...prev, isLoading: false}));
      }
    }
  };

  return (
    <SafeAreaView
      style={[commonStyles.backgroundStyle, commonStyles.safeAreaView]}>
      <View style={styles.authFormContainer}>
        <Text
          style={[commonStyles.text, commonStyles.heading, styles.margin32]}>
          Register as a gatekeeper
        </Text>

        <Text style={[commonStyles.text]}>Enter your first name</Text>
        <TextInput
          onChangeText={setFirstName}
          style={commonStyles.standardInput}
        />
        {isInputErrorVisible ? (
          <Text style={[commonStyles.text, commonStyles.textRed]}>
            First name should have more than 1 character
          </Text>
        ) : null}

        <Text style={[commonStyles.text]}>Enter your last name</Text>
        <TextInput
          onChangeText={setLastName}
          style={commonStyles.standardInput}
        />

        <AsyncButton
          text="Apply as gatekeeper"
          handlePress={handleSubmit}
          isLoading={apiStatus.isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  authFormContainer: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 20,
  },
  margin32: {
    marginVertical: 32,
  },
});
