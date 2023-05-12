import { configureStore } from '@reduxjs/toolkit';
import { chatSlice } from './slices/chatSlice';
import { externalDataSlice } from './slices/externalDataSlice';
import { settingsSlice } from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
    chat: chatSlice.reducer,
    externalData: externalDataSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
