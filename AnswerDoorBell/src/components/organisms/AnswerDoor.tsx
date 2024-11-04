import {Text, StyleSheet, SafeAreaView, View} from 'react-native';
import React, {useEffect} from 'react';
import {FIREBASE_ENDPOINT} from '@env';
import axios from 'axios';

import commonStyles from '../../styles/common';
import showToast from '../../utils/toasts';
import AsyncButton from '../atoms/AsyncButton';
import {useMMKVObject, useMMKVString} from 'react-native-mmkv';
import useApiStatus from '../../hooks/useApiStatus';

type User = {
  firstName: string;
  lastName: string;
  status: 'approved' | 'rejected' | 'review-pending';
};

export default function AnswerDoor() {
  const [userId] = useMMKVString('userId');
  const [storedUserDetails, setStoredUserDetails] = useMMKVObject<User>('user');

  const {apiStatus, setApiStatus} = useApiStatus();

  useEffect(() => {
    let ignore = false;

    const fetchUserDetails = async () => {
      if (!ignore && typeof storedUserDetails === 'undefined' && userId) {
        showToast({
          type: 'info',
          text1: 'Fetching user details',
          text2: null,
        });
        try {
          const res = await axios.get(
            `${FIREBASE_ENDPOINT}/getGateKeeperDetailsById?id=${userId}`,
          );

          if (res.data.data.status === 'approved') {
            setStoredUserDetails({
              firstName: res.data.data.firstName,
              lastName: res.data.data.lastName,
              status: res.data.data.status,
            });
          }
        } catch (error) {
          showToast({
            type: 'error',
            text1: 'Failed to get gatekeeper details',
            text2: null,
          });
        }
      }
    };

    fetchUserDetails();

    return () => {
      ignore = true;
    };
  }, [setStoredUserDetails, storedUserDetails, userId]);

  const handleAnswerDoorPress = async () => {
    if (storedUserDetails?.status === 'approved') {
      try {
        setApiStatus(prev => ({...prev, isLoading: true}));
        await axios.post(`${FIREBASE_ENDPOINT}/answerVisit`, {
          id: userId,
        });
        setApiStatus(prev => ({...prev, isSuccess: true}));
        showToast({
          type: 'success',
          text1: 'Go open the door and greet the visitor!',
          text2: null,
        });
      } catch (error: any) {
        setApiStatus(prev => ({...prev, isError: true}));
        if (error?.response && error?.response?.status) {
          showToast({
            type: 'error',
            text1: 'Failed to answer visit!',
            text2: error?.response?.data?.error || '',
          });
        }
      } finally {
        setApiStatus(prev => ({...prev, isLoading: false}));
      }
    } else if (storedUserDetails?.status === 'rejected') {
      showToast({
        type: 'error',
        text1: 'Gatekeeper authorisation rejected',
        text2: 'Contact admin',
      });
    } else if (storedUserDetails?.status === 'review-pending') {
      showToast({
        type: 'info',
        text1: 'Gatekeeper authorization pending',
        text2: 'Contact admin',
      });
    }
  };

  return (
    <SafeAreaView
      style={[commonStyles.backgroundStyle, commonStyles.safeAreaView]}>
      <View style={styles.answerDoorContainer}>
        <Text style={[commonStyles.text, commonStyles.heading]}>
          Hi {storedUserDetails?.firstName}, press the below button if you are
          opening the door
        </Text>

        <AsyncButton
          text="I am opening the door!"
          handlePress={handleAnswerDoorPress}
          isLoading={apiStatus.isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  answerDoorContainer: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 100,
  },
});
