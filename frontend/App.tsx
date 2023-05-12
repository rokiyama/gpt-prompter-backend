import { StatusBar } from 'expo-status-bar';
import 'react-native-url-polyfill/auto';
import { Provider } from 'react-redux';
import { TailwindProvider } from 'tailwind-rn';
import { RootNavigator } from './src/navigator/RootNavigator';
import { store } from './src/redux/store';
import utilities from './tailwind.json';

export default function App() {
  return (
    <Provider store={store}>
      <TailwindProvider utilities={utilities}>
        <RootNavigator />
        <StatusBar style="auto" />
      </TailwindProvider>
    </Provider>
  );
}
