import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  Text,
} from 'react-native';
import commonStyles from '../../styles/common';

export default function AsyncButton({
  text,
  handlePress,
  isLoading,
}: {
  text: string;
  handlePress: (event: GestureResponderEvent) => void;
  isLoading: boolean;
}) {
  return (
    <Pressable
      onPress={handlePress}
      style={[commonStyles.button, commonStyles.asyncButton]}>
      <Text style={commonStyles.buttonText}>{text}</Text>
      {isLoading ? <ActivityIndicator color="#f1f5f9" /> : null}
    </Pressable>
  );
}
