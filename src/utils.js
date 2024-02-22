import axios from 'axios';
import { updateRequest } from './constants';

const getStringProxiedUrl = (url) => {
  const resultUrl = new URL('https://allorigins.hexlet.app/get');
  resultUrl.searchParams.set('url', url);
  resultUrl.searchParams.set('disableCache', true);
  return resultUrl.toString();
};

export const getValues = (value) => axios({
  method: 'get',
  url: getStringProxiedUrl(value),
  timeout: updateRequest,
});

export const isURL = (url) => new URL(url);

export const customErrors = {
  string: {
    url: () => ({ key: 'urlError' }),
    required: () => ({ key: 'empty' }),
  },
  mixed: {
    notOneOf: () => ({ key: 'dublicateError' }),
  },
};
