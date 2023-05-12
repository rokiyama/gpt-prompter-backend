import { Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { Button } from '../atoms/Button';
import { i18n } from '../../i18n';
import { Modal } from '../atoms/Modal';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  messages: Array<string>;
  onPressOk?: () => void;
};

export const AlertModal = ({
  visible,
  setVisible,
  title,
  messages,
  onPressOk,
}: Props) => {
  const tw = useTailwind();

  return (
    <Modal visible={visible}>
      <Text style={tw('m-2 text-xl font-bold')}>{title}</Text>
      {messages.map((m, i) => (
        <Text key={i} style={tw('m-2 text-lg')}>
          {m}
        </Text>
      ))}
      <View style={tw('flex-row justify-end')}>
        <Button
          title={i18n.t('ok')}
          onPress={() => {
            setVisible(false);
            onPressOk?.();
          }}
        />
      </View>
    </Modal>
  );
};
