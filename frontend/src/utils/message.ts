import { SYSTEM, USER } from '../constants';
import { uuid } from './uuid';

export const newSystemMessage = (text: string) => {
  return {
    id: uuid(),
    createdAt: Date.now(),
    text,
    user: SYSTEM,
    system: true,
  };
};

export const newUserMessage = (text: string) => {
  return {
    id: uuid(),
    createdAt: Date.now(),
    text,
    user: USER,
  };
};
