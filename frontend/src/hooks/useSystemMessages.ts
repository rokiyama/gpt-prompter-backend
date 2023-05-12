import { getLocales } from 'expo-localization';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import {
  selectSystemMessages,
  SystemMessage,
} from '../redux/slices/externalDataSlice';

export const useSystemMessages = () => {
  const systemMessages = useAppSelector(selectSystemMessages);
  const [localeMessages, setLocaleMessages] = useState<Array<SystemMessage>>(
    []
  );

  useEffect(() => {
    const locales = getLocales()[0];
    setLocaleMessages(
      systemMessages[locales.languageCode] ||
        systemMessages['ja'] ||
        systemMessages['en']
    );
  }, [systemMessages]);

  return { systemMessages: localeMessages };
};
