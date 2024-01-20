import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';
import initView from './view';
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

export default () => {
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
      const state = onChange(initialState, initView(elements, i18n, initialState));

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const value = (formData.get('url')).trim();
        const urls = initialState.feeds.map((feed) => feed.id);

        const schema = makeSchema(urls);

        schema.validate(value)
          .then(() => {
            state.form.processState = 'sending';
            state.form.error = null;
            return getData(value);
          })
          .then((response) => {
            const parser = new Parser(response.data.contents, value);

            state.feeds.push(parser.feed);
            state.posts.push(...parser.posts);
            state.form.processState = 'success';
            elements.feedback.textContent = i18n.t('successUrl');
            elements.feedback.style.color = 'green';
          })
          .catch((error) => {
            state.form.error = error.message;
            return _.keyBy(error.inner, 'path');
          });
      });

      elements.postsList.addEventListener('click', (event) => {
        const postId = event.target.dataset.id;

        if (postId) {
          state.uiState.displayedPost = postId;
          state.uiState.viewedPostIds.add(postId);
        }
      });

      updatePosts(state);
    });
};
