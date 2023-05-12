import { useState } from 'react';
import { Button } from '../../component/atoms/Button';
import { TextInputModal } from '../../component/organisms/TextInputModal';
import { i18n } from '../../i18n';
import { useAppDispatch } from '../../redux/hooks';
import { addMessages } from '../../redux/slices/chatSlice';
import { newSystemMessage } from '../../utils/message';

type Props = {
  onPressOk: () => void;
};

export const SystemMessageEditModal = ({ onPressOk }: Props) => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const dispatch = useAppDispatch();

  return (
    <>
      <Button
        title={i18n.t('inputManually')}
        onPress={() => {
          setVisible(true);
        }}
      />
      <TextInputModal
        visible={visible}
        text={text}
        setText={setText}
        setVisible={setVisible}
        onPressOk={() => {
          if (text) {
            dispatch(addMessages([newSystemMessage(text.trim())]));
            onPressOk();
          }
        }}
        onPressCancel={() => {
          setText('');
        }}
      />
    </>
  );
};
