import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../../types/chat';
import { RootState } from '../store';

interface ChatState {
  text: string;
  messages: Array<Message>;
}

const initialState: ChatState = {
  text: '',
  messages: [],
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    inputText: (state, action: PayloadAction<string>) => {
      state.text = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addMessages: (state, action: PayloadAction<Array<Message>>) => {
      state.messages.push(...action.payload);
    },
    appendLastMessage: (state, action: PayloadAction<string>) => {
      state.messages[state.messages.length - 1].text += action.payload;
    },
  },
});

export const { inputText, clearMessages, addMessages, appendLastMessage } =
  chatSlice.actions;

export const selectText = (state: RootState) => state.chat.text;
export const selectMessages = (state: RootState) => state.chat.messages;

// export default chatSlice.reducer;
