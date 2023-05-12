import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Keyboard } from 'react-native';

const INITIAL_HEIGHT = 300;

const keyboardHeightContext = createContext(0);

export const useKeyboardHeightContext = () => useContext(keyboardHeightContext);

type Props = {
  children: ReactNode;
};

export const KeyboardHeightContextProvider = ({ children }: Props) => {
  const [keyboardHeight, setKeyboardHeight] = useState(INITIAL_HEIGHT);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <keyboardHeightContext.Provider value={keyboardHeight}>
      {children}
    </keyboardHeightContext.Provider>
  );
};
