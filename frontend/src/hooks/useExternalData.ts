import { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import {
  loadExternalData,
  setLoading,
} from '../redux/slices/externalDataSlice';

export const useExternalData = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setLoading(true));
    dispatch(loadExternalData());
  }, [dispatch]);
};
