import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';
import initView from './view';
import resources from './locales/index';
import Parser from './parse';
import initialState from './state';

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

const setPosts = (posts, watchedState) => {
  watchedState.posts.push(...posts);
};

const setFeed = (feed, watchedState) => {
  watchedState.feeds.push(feed);
};

const updatePosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => getData(feed.id));
  return Promise.all(promises)
    .then((response) => {
      response.forEach((element) => {
        const parser = new Parser(element.data.contents, element.data.status.url);
        const { posts, feed } = parser;
        const postsFromState = watchedState.posts;
        const postsWithCurrentId = postsFromState.filter((post) => post.feedId === feed.id);
        const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
        const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));

        if (newPosts.length === 0) {
          return;
        }

        watchedState.posts.unshift(...newPosts);
      });
    })
    .catch((error) => {
      watchedState.form.error = error.message;
    })
    .finally(() => setTimeout(updatePosts, 5000, watchedState));
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
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  })

    .then(() => {
      const watchedState = onChange(initialState, initView(elements, i18n, initialState));

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const value = (formData.get('url')).trim();
        const urls = initialState.feeds.map((feed) => feed.id);

        const schema = makeSchema(urls);

        schema.validate(value)
          .then(() => {
            watchedState.form.processState = 'sending';
            watchedState.form.error = null;
            return getData(value);
          })
          .then((response) => {
            const parser = new Parser(response.data.contents, value);
            setFeed(parser.feed, watchedState);
            setPosts(parser.posts, watchedState);

            watchedState.form.processState = 'success';
          })
          .catch((error) => {
            watchedState.form.error = error.message;
            return _.keyBy(error.inner, 'path');
          });
      });
      updatePosts(watchedState);
    });
};
