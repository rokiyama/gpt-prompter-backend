import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { Button } from '../../component/atoms/Button';
import { usePrompts } from '../../hooks/usePrompts';
import { i18n } from '../../i18n';
import { useAppDispatch } from '../../redux/hooks';
import { inputText } from '../../redux/slices/chatSlice';
import { RootStackParamList } from '../../types/navigation';
import { render } from './template';

type Props = NativeStackScreenProps<RootStackParamList, 'PromptEdit'>;

export const PromptEditScreen = ({ navigation, route }: Props) => {
  const tw = useTailwind();
  const dispatch = useAppDispatch();
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const { prompts } = usePrompts();

  const prompt = prompts
    .map((category) => category.data)
    .flat()
    .find((d) => d.id === route.params.id);

  useEffect(() => {
    if (!prompt) {
      return;
    }
    setOutput(render(prompt.template, variables));
  }, [prompt, variables]);

  return (
    <SafeAreaView style={tw('m-3 flex-1')}>
      <View style={tw('m-2')}>
        <Text>{prompt?.description}</Text>
        {prompt?.variables && Object.keys(prompt.variables).length ? (
          <Text style={tw('mt-2')}>{i18n.t('promptEditDescription')}</Text>
        ) : undefined}
      </View>
      {prompt &&
        Object.entries(prompt.variables).map(([name, placeholder], i) => (
          <InputVariable
            key={i}
            name={name}
            value={variables[name]}
            placeholder={placeholder}
            onChange={(text) => {
              setVariables((v) => ({ ...v, [name]: text }));
            }}
          />
        ))}
      <Text style={tw('m-1 text-lg font-bold')}>{i18n.t('prompt')}</Text>
      <ScrollView contentContainerStyle={tw('m-1')}>
        <Text style={tw('m-1 text-sm')}>{output}</Text>
      </ScrollView>
      <View style={tw('flex-grow m-2 p-2')}>
        <Button
          title={i18n.t('ok')}
          onPress={() => {
            if (!prompt) {
              return;
            }
            dispatch(
              inputText(render(prompt.template, variables, prompt.variables))
            );
            navigation.popToTop();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const InputVariable = ({
  name,
  value,
  placeholder,
  onChange,
}: {
  name: string;
  value: string;
  placeholder: string;
  onChange: (text: string) => void;
}) => {
  const tw = useTailwind();
  return (
    <View style={tw('flex-row items-center bg-white m-2 p-2 rounded-md')}>
      <Text style={tw('m-1 p-1')}>{name}</Text>
      <TextInput
        style={tw('grow m-1 p-1 w-0')}
        value={value}
        placeholder={placeholder}
        onChangeText={onChange}
      />
    </View>
  );
};
