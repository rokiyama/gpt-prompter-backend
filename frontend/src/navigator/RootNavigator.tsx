import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-url-polyfill/auto';
import { Button } from '../component/atoms/Button';
import { useSettings } from '../hooks/useSettings';
import { useExternalData } from '../hooks/useExternalData';
import { i18n } from '../i18n';
import { PromptEditScreen } from '../screens/prompt/PromptEditScreen';
import { PromptScreen } from '../screens/prompt/PromptScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { SystemMessageScreen } from '../screens/systemMessage/SystemMessageScreen';
import { RootStackParamList } from '../types/navigation';
import { TestScreen } from '../screens/test/TestScreen';
import { KeyboardHeightContextProvider } from '../context/KeyboardHeightContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  useSettings();
  useExternalData();
  return (
    <KeyboardHeightContextProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              headerTitle: '',
              headerLeft: () => (
                <Button
                  title={i18n.t('systemMessage')}
                  onPress={() => navigation.push('SystemMessage')}
                />
              ),
              headerRight: () => (
                <Button
                  title={i18n.t('settings')}
                  onPress={() => navigation.push('Settings')}
                />
              ),
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerTitle: i18n.t('settings') }}
          />
          <Stack.Screen
            name="SystemMessage"
            component={SystemMessageScreen}
            options={{ headerTitle: i18n.t('systemMessage') }}
          />
          <Stack.Screen
            name="Prompt"
            component={PromptScreen}
            options={{ headerTitle: i18n.t('prompt') }}
          />
          <Stack.Screen
            name="PromptEdit"
            component={PromptEditScreen}
            options={{ headerTitle: i18n.t('promptEdit') }}
          />
          <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </KeyboardHeightContextProvider>
  );
};
