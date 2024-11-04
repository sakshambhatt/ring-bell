import Toast from 'react-native-toast-message';

export const showToast = ({
  type,
  text1,
  text2,
}: {
  type: 'success' | 'error' | 'info';
  text1: string;
  text2: string | null;
}) => {
  if (text2) {
    Toast.show({type, text1, text2});
  } else {
    Toast.show({type, text1});
  }
};

export default showToast;
