import analytics from '@react-native-firebase/analytics';

export default async function logEvent({
  eventName,
  attributes,
}: {
  eventName: string;
  attributes: Object;
}) {
  await analytics().logEvent(eventName, attributes);
}
