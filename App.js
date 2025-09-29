import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import './services/i18n';
import { getLanguage, isAuthedOrSkipped, clearAuth } from './services/storage';
import LanguageSelection from './app/LanguageSelection';
import AuthScreen from './app/AuthScreen';
import HomeScreen from './app/HomeScreen';
import SitupTest from './app/SitupTest';
import JumpTest from './app/JumpTest';
import ResultScreen from './app/ResultScreen';
import MyResults from './app/MyResults';

const Stack = createNativeStackNavigator();
const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent' },
};

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [navKey, setNavKey] = useState(0);

  useEffect(() => {
    const bootstrap = async () => {
      // Always start fresh from LanguageSelection unless explicitly changed during this session
      await clearAuth();
      setInitialRoute('LanguageSelection');
      setNavKey((k) => k + 1);
    };
    bootstrap();
  }, []);

  if (!initialRoute) return null;

  return (
    <PaperProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer key={navKey} theme={navTheme}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: true,
            headerTitleStyle: { fontWeight: '800' },
            headerTransparent: false,
            headerStyle: { backgroundColor: '#111827' },
            headerTintColor: '#FDE68A',
            contentStyle: { backgroundColor: '#0f172a' },
          }}
        >
          <Stack.Screen name="LanguageSelection" component={LanguageSelection} options={{ headerShown: false }} />
          <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Welcome' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard', headerShown: false }} />
          <Stack.Screen name="SitupTest" component={SitupTest} options={{ title: 'Sit-up Test' }} />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Result' }} />
          <Stack.Screen name="JumpTest" component={JumpTest} options={{ title: 'Jump Test' }} />
          <Stack.Screen name="MyResults" component={MyResults} options={{ title: 'My Results' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}


