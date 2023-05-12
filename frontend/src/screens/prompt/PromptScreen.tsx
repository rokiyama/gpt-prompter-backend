import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { CollapsibleList } from '../../component/atoms/CollapsibleList';
import { CHAT_AI } from '../../constants';
import { usePrompts } from '../../hooks/usePrompts';
import { i18n } from '../../i18n';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectMessages } from '../../redux/slices/chatSlice';
import {
  loadExternalData,
  selectLoading,
  setLoading,
} from '../../redux/slices/externalDataSlice';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Prompt'>;

export const PromptScreen = ({ navigation }: Props) => {
  const tw = useTailwind();
  const dispatch = useAppDispatch();
  const { prompts } = usePrompts();
  const loading = useAppSelector(selectLoading);
  const messages = useAppSelector(selectMessages);
  const [openSectionIds, setOpenSectionIds] = useState<Array<string>>([]);

  useEffect(() => {
    const first = messages.filter((m) => m.user.id === CHAT_AI.id).length < 1;
    setOpenSectionIds(
      prompts.filter((c) => (first ? c.first : !c.first)).map((c) => c.id)
    );
  }, [prompts, messages]);

  console.log(JSON.stringify({ openSectionIds }));

  return (
    <SafeAreaView style={tw('m-3 flex-1')}>
      <View style={tw('m-2')}>
        <Text>{i18n.t('promptDescription')}</Text>
      </View>
      <CollapsibleList
        sections={prompts}
        openSectionIds={openSectionIds}
        setOpenSectionIds={setOpenSectionIds}
        renderItem={(item) => (
          <TouchableOpacity
            onPress={() => {
              navigation.push('PromptEdit', { id: item.id });
            }}
          >
            <Text>{item.title}</Text>
          </TouchableOpacity>
        )}
        refreshing={loading}
        onRefresh={() => {
          dispatch(setLoading(true));
          dispatch(loadExternalData());
        }}
      />
    </SafeAreaView>
  );
};
