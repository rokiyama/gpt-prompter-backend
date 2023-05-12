import { Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { Button } from '../../component/atoms/Button';
import { Modal } from '../../component/atoms/Modal';
import { i18n } from '../../i18n';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  select: (model: 'gpt-4' | 'gpt-3.5-turbo') => void;
};

export const SelectModelModal = ({ visible, setVisible, select }: Props) => {
  const tw = useTailwind();

  return (
    <Modal visible={visible}>
      <Text style={tw('text-lg')}>{i18n.t('selectModel')}:</Text>
      <View>
        {['gpt-4', 'gpt-3.5-turbo'].map((model) => (
          <Button
            key={model}
            title={model}
            onPress={() => {
              setVisible(false);
              if (model === 'gpt-4' || model === 'gpt-3.5-turbo') {
                select(model);
              }
            }}
          />
        ))}
      </View>
    </Modal>
  );
};
