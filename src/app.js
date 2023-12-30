import i18next from 'i18next';
import ru from './locales/ru';
import render from './render';

export default () => {
  const i18nextInstance = i18next.createInstance();

  const initializeI18next = () => {
    const promise = i18nextInstance.init({
      lng: 'ru',
      debug: true,
      resources: {
        ru,
      },
    })
      .then(() => i18nextInstance);
    return promise;
  };

  initializeI18next()
    .then(() => {
      render(i18nextInstance);
    })
    .catch((error) => {
      throw error;
    });
};
