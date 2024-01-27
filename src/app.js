import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import watch from './view';
import resources from './locales/index';
import Parser from './parse';
import { initialState } from './constants';

const getProxiedUrl = (url) => {
  const resultUrl = new URL('https://allorigins.hexlet.app/get');
  resultUrl.searchParams.set('url', url);
  resultUrl.searchParams.set('disableCache', true);
  return resultUrl;
};

const getData = (data) => axios.get(getProxiedUrl(data));

const makeSchema = (validatedLinks) => yup.string()
  .required()
  .url()
  .notOneOf(validatedLinks);

const updatePosts = (state) => {
  const promises = state.feeds.map((feed) => getData(feed.id));
  return Promise.all(promises)
    .then((response) => {
      response.forEach((element) => {
        const parser = new Parser(element.data.contents, element.data.status.url);
        const { posts, feed } = parser;
        const postsFromState = state.posts;
        const postsWithCurrentId = postsFromState.filter((post) => post.feedId === feed.id);
        const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
        const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));

        if (newPosts.length === 0) {
          return;
        }

        state.posts.unshift(...newPosts);
      });
    })
    .catch((error) => {
      state.form.error = error.message;
    })
    .finally(() => setTimeout(updatePosts, 5000, state));
};

const handleError = (error) => {
  if (error.isParsingError) {
    return 'rssError';
  }

  if (axios.isAxiosError(error)) {
    return 'networkError';
  }

  return error.message.key ?? 'unknown';
};

const validate = (url, urls, watchedState) => {
  const schema = makeSchema(urls);

  schema.validate(url)
    .then(() => {
      watchedState.form.isValid = null;
      watchedState.loadingProcess.status = 'sending';
      watchedState.form.error = '';
      watchedState.loadingProcess.error = '';
      return getData(url);
    })
    .then((response) => {
      const parser = new Parser(response.data.contents, url);

      watchedState.form.isValid = true;
      watchedState.loadingProcess.status = 'success';
      watchedState.form.error = '';
      watchedState.loadingProcess.error = '';
      watchedState.feeds.push(parser.feed);
      watchedState.posts.push(...parser.posts);
    })
    .catch((error) => {
      watchedState.form.isValid = false;
      watchedState.loadingProcess.status = 'invalid';
      watchedState.loadingProcess.error = handleError(error);
    });
};

export default () => {
  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'dublicateError' }),
    },
    string: {
      url: () => ({ key: 'urlError' }),
      required: () => ({ key: 'empty' }),
    },
  });

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

        validate(url, urls, watchedState);
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
