import React, { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { Provider } from 'react-redux';
import StackNavigation from './app/navigations/StackNavigation';
import { store } from './app/redux/store';
import { Text as RNText, TextProps, Linking, Platform, Alert, PermissionsAndroid} from 'react-native';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

// **Firebase configuration (replace placeholders with your actual project details)**
const firebaseConfig = {
  apiKey: "AIzaSyA5UEWEkfKOEtIERUI-6NF5vGkuMA1ZqFM", // From api_key.current_key
  authDomain: "ind-heart-suraksha.firebaseapp.com", // Derived from project_id
  projectId: "ind-heart-suraksha", // From project_info.project_id
  storageBucket: "ind-heart-suraksha.firebasestorage.app", // From project_info.storage_bucket
  messagingSenderId: "1083035191759", // From project_info.project_number
  appId: "1:1083035191759:android:7d839f9743ac6f2c7aeaba", // From client[0].client_info.mobilesdk_app_id
};
// Custom Text component
const Text = (props: TextProps) => {
  return <RNText {...props} allowFontScaling={false} />;
};

const App = () => {
  //const [fcmToken, setFcmToken] = useState(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null); // Specify type as string or null


  useEffect(() => {
    // Initialize Firebase inside the useEffect
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log('Firebase initialized'); // Add a log for confirmation
    } else {
      console.log("Firebase already initialized");
    }

    // Now it's safe to use messaging
    requestNotificationPermission();

    // Get the FCM token on app mount and whenever it changes
    messaging().getToken()
      .then(token => {
        console.log('FCM Token:', token);
        setFcmToken(token);
      });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe; // Important: Return the unsubscribe function
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <Provider store={store}>
      <StackNavigation />
    </Provider>
  );
};

// Background message handler (keep this outside the component)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
});

async function checkNotificationPermission() {
  const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  return granted;
}

async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    const alreadyGranted = await checkNotificationPermission();
    if (alreadyGranted) {
      console.log('Notification permission already granted');
      return;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Notification permission granted');
    } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
      console.log('Notification permission denied');
      Alert.alert(
        'Notification Permission Required',
        'Please enable notifications in app settings to receive important updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() },
        ]
      );
    } else {
      console.log('Notification permission request cancelled');
    }
  }
}

registerRootComponent(App);