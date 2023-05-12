import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Constants from 'expo-constants';
import { array, boolean, object, record, string } from 'zod';
import { schemaForType } from '../../utils/schema';
import { RootState } from '../store';

export type SystemMessage = {
  id: string;
  text: string;
};

export type Prompt = {
  id: string;
  title: string;
  template: string;
  description: string;
  variables: Record<string, string>;
  author: string;
  source: string;
};

export type PromptCategory = {
  id: string;
  title: string;
  first: boolean;
  data: Array<Prompt>;
};

interface ExternalsState {
  data: {
    systemMessages: Record<string, Array<SystemMessage>>;
    prompts: Record<string, Array<PromptCategory>>;
  };
  loading: boolean;
}

const initialState: ExternalsState = {
  data: {
    systemMessages: {},
    prompts: {},
  },
  loading: false,
};

export const loadExternalData = createAsyncThunk(
  'externalData/load',
  async () => {
    try {
      const res = await axios.get(Constants.expoConfig?.extra?.externalDataUrl);
      const parsed = ExternalData.parse(res.data);
      console.log('ExternalData', parsed);
      return parsed;
    } catch (err) {
      console.error('loadExternalData error', err);
      return initialState.data;
    }
  }
);

export const externalDataSlice = createSlice({
  name: 'externalData',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadExternalData.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
    });
  },
});

export const { setLoading } = externalDataSlice.actions;

export const selectSystemMessages = (state: RootState) =>
  state.externalData.data.systemMessages;
export const selectPrompts = (state: RootState) =>
  state.externalData.data.prompts;
export const selectLoading = (state: RootState) => state.externalData.loading;

const ExternalData = schemaForType<ExternalsState['data']>()(
  object({
    systemMessages: record(
      array(
        object({
          id: string(),
          text: string(),
        })
      )
    ),
    prompts: record(
      array(
        object({
          id: string(),
          title: string(),
          first: boolean(),
          data: array(
            object({
              id: string(),
              title: string(),
              template: string(),
              description: string(),
              variables: record(string()),
              author: string(),
              source: string(),
            })
          ),
        })
      )
    ),
  })
);
