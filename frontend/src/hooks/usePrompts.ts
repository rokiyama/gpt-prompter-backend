import { getLocales } from 'expo-localization';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import {
  PromptCategory,
  selectPrompts,
} from '../redux/slices/externalDataSlice';

export const usePrompts = () => {
  const [localePrompts, setLocalePrompts] = useState<Array<PromptCategory>>([]);
  const prompts = useAppSelector(selectPrompts);

  useEffect(() => {
    const locales = getLocales()[0];
    setLocalePrompts(
      prompts[locales.languageCode] || prompts['ja'] || prompts['en']
    );
  }, [prompts]);

  return { prompts: localePrompts };
};
