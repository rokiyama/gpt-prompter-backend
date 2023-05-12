import { useEffect, useState } from 'react';
import { AlertModal } from '../../component/organisms/AlertModal';
import { i18n } from '../../i18n';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { save, selectSettings } from '../../redux/slices/settingsSlice';

export const Tutorial = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!settings.hideTutorial) {
      setModalVisible(true);
    }
  }, [settings.hideTutorial]);

  return (
    <AlertModal
      visible={modalVisible}
      setVisible={setModalVisible}
      title={i18n.t('tutorial.welcome')}
      messages={[i18n.t('tutorial.message1'), i18n.t('tutorial.message2')]}
      onPressOk={() => {
        dispatch(save({ ...settings, hideTutorial: true }));
      }}
    />
  );
};
