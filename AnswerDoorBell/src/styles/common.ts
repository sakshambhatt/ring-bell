import {StyleSheet} from 'react-native';

const commonStyles = StyleSheet.create({
  safeAreaView: {
    height: '100%',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  backgroundStyle: {
    backgroundColor: '#F1F5F9',
  },
  text: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '400',
  },
  textRed: {
    color: '#dc2626',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 16,
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#0f172a',
    height: 44,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  asyncButton: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 8,
  },
  buttonText: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
  },
  standardInput: {
    borderWidth: 1,
    borderColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    color: '#0f172a',
  },
});

export default commonStyles;
