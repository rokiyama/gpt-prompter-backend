import { IMessage, User as GiftedUser } from 'react-native-gifted-chat';

export type Message = {
  id: string | number;
  text: string;
  createdAt: number;
  user: User;
  system?: boolean;
};

export const toMessage = (m: IMessage): Message => ({
  ...m,
  id: m._id,
  text: m.text,
  createdAt:
    typeof m.createdAt === 'object' ? m.createdAt.getTime() : m.createdAt,
  user: toUser(m.user),
  system: false,
});

export const toIMessage = (m: Message): IMessage => ({
  ...m,
  _id: m.id,
  user: toGiftedUser(m.user),
});

export type User = {
  id: string | number;
  name: string;
  avatar?: string | number;
};

export const toUser = (user: GiftedUser): User => ({
  id: user._id,
  name: user.name || '',
  avatar: typeof user.avatar !== 'function' ? user.avatar : undefined,
});

export const toGiftedUser = (user: User): GiftedUser => ({
  ...user,
  _id: user.id,
});
