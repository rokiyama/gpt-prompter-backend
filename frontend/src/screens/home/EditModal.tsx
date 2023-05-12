import { useEffect, useState } from 'react';
import { TextInputModal } from '../../component/organisms/TextInputModal';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { inputText, selectText } from '../../redux/slices/chatSlice';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onPressOk: (text: string) => void;
};

export const EditModal = ({ visible, setVisible, onPressOk }: Props) => {
  const dispatch = useAppDispatch();
  const initialText = useAppSelector(selectText);
  const [text, setText] = useState('');
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  return (
    <TextInputModal
      text={text}
      setText={setText}
      visible={visible}
      setVisible={setVisible}
      onPressOk={() => {
        if (text) {
          dispatch(inputText(text));
          setText('');
        }
      }}
    />
  );
};
