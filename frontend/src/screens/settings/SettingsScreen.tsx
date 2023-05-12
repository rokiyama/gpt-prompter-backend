import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { Button } from '../../component/atoms/Button';
import { i18n } from '../../i18n';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { save, selectSettings } from '../../redux/slices/settingsSlice';
import { RootStackParamList } from '../../types/navigation';
import { SelectModelModal } from './SelectModelModal';

// const ListText = ({ children }: { children: ReactNode }) => {
//   const tw = useTailwind();
//   const onPress = (url: string) => {
//     Linking.openURL(url);
//   };
//   return (
//     <ParsedText
//       style={tw('m-1 flex-wrap text-slate-500')}
//       parse={[
//         {
//           type: 'url',
//           style: tw('text-blue-400 underline'),
//           onPress,
//         },
//       ]}
//     >
//       {children}
//     </ParsedText>
//   );
// };

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: Props) => {
  const tw = useTailwind();
  const [modalVisible, setModalVisible] = useState(false);
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();

  // const toggle = (value: boolean) => {
  //   dispatch(
  //     save({
  //       ...settings,
  //       mode: value ? 'apiKey' : 'userId',
  //     })
  //   );
  // };

  return (
    <SafeAreaView style={tw('m-3')}>
      <ScrollView>
        <View style={tw('bg-white m-3 p-4 rounded-md')}>
          <View style={tw('flex-row')}>
            <Text style={tw('m-2')}>{i18n.t('gptModel')}:</Text>
            <Text style={tw('m-2 flex-wrap text-slate-400')}>
              {settings.model}
            </Text>
          </View>
          <Button
            title={i18n.t('changeModel')}
            onPress={() => setModalVisible(true)}
          />
          <SelectModelModal
            visible={modalVisible}
            setVisible={setModalVisible}
            select={(model) => {
              dispatch(save({ ...settings, model }));
            }}
          />
        </View>
        <View style={tw('bg-white m-3 p-4 rounded-md')}>
          <Button
            title={i18n.t('redisplayTutorial')}
            onPress={() => {
              dispatch(save({ ...settings, hideTutorial: false }));
              navigation.popToTop();
            }}
          />
        </View>

        {/*
        <View
          style={tw(
            'flex-row items-center justify-between bg-white m-3 p-4 rounded-md'
          )}
        >
          <Text style={tw('m-2')}>{i18n.t('useApiKeyMode')}</Text>
          <Switch value={settings.mode === 'apiKey'} onValueChange={toggle} />
        </View>
        <View style={tw('m-2')}>
          <ListText>{i18n.t('apiKeyDescription')}</ListText>
        </View>
        <View style={tw('bg-white m-3 p-4 rounded-md')}>
          <Text style={tw('m-2')}>{i18n.t('apiKey')}:</Text>
          <Text style={tw('m-2 flex-wrap text-slate-400')}>
            {settings.isApiKeyConfigured
              ? i18n.t('configured')
              : i18n.t('notYetConfigured')}
          </Text>
          <Button
            title={i18n.t('setApiKey')}
            onPress={() => setModalVisible(true)}
            disabled={settings.mode !== 'apiKey'}
          />
        </View>
        <View style={tw('m-2')}>
          <ListText>{i18n.t('apiKeyInstruction.0')}</ListText>
          <ListText>{i18n.t('apiKeyInstruction.1')}</ListText>
          <ListText>{i18n.t('apiKeyInstruction.2')}</ListText>
          <ListText>{i18n.t('apiKeyInstruction.3')}</ListText>
        </View>
        <Button
          title="Open TestScreen"
          onPress={() => navigation.push('Test')}
        />
      */}
      </ScrollView>
    </SafeAreaView>
  );
};
