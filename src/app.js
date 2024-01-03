import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';
import initView from './view';
import resources from './locales/index';
import parse from './parse';

export default () => {
  const state = {
    form: {
      field: {
        url: '',
      },
      allUrls: [],
      processState: '',
      error: {},
      parsed: {},
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'dublicateError' }),
    },
    string: {
      url: () => ({ key: 'urlError' }),
    },
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const watchedState = onChange(state, initView(elements, i18n, state));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const value = (formData.get('url')).trim();

    watchedState.form.field.url = value;

    const urls = state.form.allUrls.map(({ url }) => url);
    const schema = yup.string()
      .url()
      .notOneOf(urls);

    const validated = (url) => {
      watchedState.form.allUrls.push({ url, feedId: _.uniqueId() });
      watchedState.form.field.url = '';
      watchedState.form.processState = 'sending';
      watchedState.form.error = {};
    };

    schema.validate(value)
      .then((url) => {
        validated(url);
        fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
          .then((response) => {
            if (response.ok) {
              return response.json();
            }

            throw new Error('Network response was not ok.');
          })
          .then((data) => {
            parse(data, watchedState, url);
          });
      })
      .catch((error) => {
        watchedState.form.error = error.message;
        return _.keyBy(error.inner, 'path');
      });
  });
};
