import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import watch from './view';
import resources from './locales/index';
import Parser from './parse';
import { initialState, updateTime } from './constants';
import { getValues, isURL, customErrors } from './utils';

const updatePosts = (state) => {
  const promises = state.feeds.map((element) => getValues(element.id)
    .then((response) => {
      const parser = new Parser(response.data.contents, response.data.status.url);

      const { posts, feed } = parser;

      const postsFromState = state.posts;

      const postsWithCurrentId = postsFromState.filter((post) => post.feedId === feed.id);
      const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
      const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));

      if (newPosts.length === 0) {
        return;
      }

      state.posts.unshift(...newPosts);
    })
    .catch(() => {}));

  return Promise.all(promises)
    .then(() => setTimeout(updatePosts, updateTime, state));
};

const handleError = (error) => {
  if (error.message.includes('Invalid URL')) {
    return 'urlError';
  }

  if (error.isParsingError) {
    return 'rssError';
  }

  if (axios.isAxiosError(error)) {
    return 'networkError';
  }

  return error.message.key ?? 'unknown';
};

const loadData = (response, url, watchedState) => {
  const parser = new Parser(response.data.contents, url);

  if (parser.parseError) {
    watchedState.form.isValid = false;
    watchedState.loadingProcess.status = 'invalid';
    watchedState.loadingProcess.error = 'rssError';
  }

  watchedState.form.isValid = true;
  watchedState.loadingProcess.status = 'success';
  watchedState.form.error = '';
  watchedState.loadingProcess.error = '';
  watchedState.feeds.push(parser.feed);
  watchedState.posts.push(...parser.posts);
};

const validate = (url, urls) => {
  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(urls);

  return schema
    .validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    feedsList: document.querySelector('.feeds'),
    postsList: document.querySelector('.posts'),
    modal: document.querySelector('.modal'),
    modalHeader: document.querySelector('.modal-header'),
    modalBody: document.querySelector('.modal-body'),
    modalHref: document.querySelector('.full-article'),
  };

  yup.setLocale(customErrors);

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  })
    .then(() => {
      const watchedState = watch(elements, i18n, initialState);

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const url = (formData.get('url')).trim();
        const urls = initialState.feeds.map((feed) => feed.id);

        validate(url, urls)
          .then(() => {
            if (watchedState.loadingProcess.enteredUrls.has(url)) {
              watchedState.form.isValid = false;
              watchedState.loadingProcess.status = 'invalid';
              watchedState.loadingProcess.error = 'dublicateError';
              return;
            }

            if (isURL(url)) {
              watchedState.loadingProcess.enteredUrls.add(url);
            }

            watchedState.form.isValid = true;
            watchedState.loadingProcess.status = 'sending';
            watchedState.form.error = '';
            watchedState.loadingProcess.error = '';

            getValues(url)
              .then((response) => {
                loadData(response, url, watchedState);
              })
              .catch((error) => {
                watchedState.form.isValid = false;
                watchedState.loadingProcess.status = 'invalid';
                watchedState.loadingProcess.error = handleError(error);
              });
          })
          .catch((error) => {
            watchedState.form.isValid = false;
            watchedState.loadingProcess.status = 'invalid';
            watchedState.loadingProcess.error = handleError(error);
          });
      });

      elements.postsList.addEventListener('click', (event) => {
        const postId = event.target.dataset.id;

        if (postId) {
          watchedState.uiState.displayedPost = postId;
          watchedState.uiState.viewedPostIds.add(postId);
        }
      });
      updatePosts(watchedState);
    });
};
