import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { Platform, SafeAreaView, Text, View } from 'react-native';
import {
  GiftedChat,
  IMessage,
  Send,
  SendProps,
} from 'react-native-gifted-chat';
import { useTailwind } from 'tailwind-rn';
import { Button } from '../../component/atoms/Button';
import { PRIMARY_COLOR, USER } from '../../constants';
import { useOpenAI } from '../../hooks/useOpenAI';
import { i18n } from '../../i18n';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  addMessages,
  clearMessages,
  inputText,
  selectMessages,
  selectText,
} from '../../redux/slices/chatSlice';
import { toGiftedUser, toIMessage, toMessage } from '../../types/chat';
import { EditModal } from './EditModal';
import { Tutorial } from './Tutorial';

type Props = {
  openPrompt: () => void;
};

export const Chat = ({ openPrompt }: Props) => {
  const tw = useTailwind();
  const dispatch = useAppDispatch();
  const text = useAppSelector(selectText);
  const messages = useAppSelector(selectMessages);
  const { loading, sendMessages, cancel, errorMessage, clearError } =
    useOpenAI();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const giftedChatRef = useRef<GiftedChat>(null);

  const onSend = useCallback(
    (newGiftedMessages: Array<IMessage>) => {
      clearError();
      giftedChatRef.current?.textInput.blur();
      const newMessages = newGiftedMessages.map(toMessage);
      dispatch(addMessages(newMessages));
      sendMessages([...messages, ...newMessages]);
    },
    [dispatch, clearError, sendMessages, messages]
  );

  const renderSend = useCallback(
    (props: SendProps<IMessage>) => (
      <Send {...props} disabled={loading}>
        <View style={tw('m-2')}>
          <Ionicons
            name="send"
            size={25}
            color={loading ? '#AAAAAA' : PRIMARY_COLOR}
          />
        </View>
      </Send>
    ),
    [tw, loading]
  );

  const renderChatFooter = useCallback(
    () => (
      <View style={tw('flex-row justify-center mb-2')}>
        <Tutorial />
        <Button
          title={i18n.t('reset')}
          onPress={() => {
            cancel();
            clearError();
            dispatch(clearMessages());
            giftedChatRef.current?.focusTextInput();
          }}
        />
        {loading && <Button title={i18n.t('cancel')} onPress={cancel} />}
        {!loading && messages.length > 1 && (
          <Button
            title={i18n.t('resend')}
            onPress={() => {
              clearError();
              sendMessages(messages);
            }}
          />
        )}
        {!loading && <Button title={i18n.t('prompt')} onPress={openPrompt} />}
      </View>
    ),
    [
      dispatch,
      tw,
      cancel,
      clearError,
      loading,
      messages,
      openPrompt,
      sendMessages,
    ]
  );

  return (
    <SafeAreaView style={tw('flex-1 bg-white')}>
      {errorMessage && (
        <View style={tw('flex-1 items-center')}>
          <Text style={tw('text-lg mt-10 text-red-500')}>
            {i18n.t('errorOccurred')}:
          </Text>
          <Text style={tw('text-lg mb-10 text-red-500')}>{errorMessage}</Text>
        </View>
      )}
      {messages.length < 1 && (
        <View style={tw('flex-1 items-center')}>
          <Text style={tw('text-lg mt-10')}>{i18n.t('welcome')}</Text>
        </View>
      )}
      <View style={tw('flex-1')}>
        <GiftedChat
          ref={giftedChatRef}
          messages={messages.slice().reverse().map(toIMessage)}
          text={text}
          onInputTextChanged={(text) => {
            dispatch(inputText(text));
          }}
          onSend={onSend}
          isTyping={loading}
          user={toGiftedUser(USER)}
          placeholder={i18n.t('sendMessage')}
          renderDay={() => <></>}
          renderTime={() => <></>}
          renderSend={renderSend}
          renderChatFooter={renderChatFooter}
          disableComposer={Platform.OS === 'ios'}
          textInputProps={
            Platform.OS === 'ios'
              ? {
                  onPressIn: () => {
                    setEditModalVisible(true);
                  },
                }
              : undefined
          }
        />
      </View>
      <EditModal
        visible={editModalVisible}
        setVisible={setEditModalVisible}
        onPressOk={() => {
          console.log('onPressOk');
        }}
      />
    </SafeAreaView>
  );
};
