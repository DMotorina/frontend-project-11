import axios from 'axios';
import { updateRequest } from './constants';

const getStringProxiedUrl = (url) => {
  const resultUrl = new URL('https://allorigins.hexlet.app/get');
  resultUrl.searchParams.set('url', url);
  resultUrl.searchParams.set('disableCache', true);
  return resultUrl.toString();
};

export default (data) => axios({
  method: 'get',
  url: getStringProxiedUrl(data),
  timeout: updateRequest,
});
