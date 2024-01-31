import * as yup from 'yup';
import axios from 'axios';

export const getProxiedUrl = (url) => {
  const resultUrl = new URL('https://allorigins.hexlet.app/get');
  resultUrl.searchParams.set('url', url);
  resultUrl.searchParams.set('disableCache', true);
  return axios.get(resultUrl);
};

export const validateObject = yup.setLocale({
  mixed: {
    notOneOf: () => ({ key: 'dublicateError' }),
  },
  string: {
    url: () => ({ key: 'urlError' }),
    required: () => ({ key: 'empty' }),
  },
});
