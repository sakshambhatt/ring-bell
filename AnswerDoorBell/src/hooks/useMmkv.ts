import {MMKV} from 'react-native-mmkv';

export default function useMmkv() {
  const storage = new MMKV();
  return storage;
}
