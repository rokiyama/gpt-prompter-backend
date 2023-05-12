import { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { load } from '../redux/slices/settingsSlice';

export const useSettings = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(load());
  }, [dispatch]);
};
