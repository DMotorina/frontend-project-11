import onChange from 'on-change';

const renderErrors = (state, { feedback }, i18n) => {
  if (!state.loadingProcess.error.length) {
    return;
  }

  feedback.classList.add('text-danger');
  feedback.textContent = i18n.t(`errors.${state.loadingProcess.error}`);
};

const createButton = (post, i18n) => {
  const button = document.createElement('button');

  button.setAttribute('type', 'button');
  button.setAttribute('data-id', post.id);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.textContent = i18n.t('button.viewing');

  return button;
};

const createFeeds = (state) => {
  const feeds = [];

  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feed.title;

    li.append(feedTitle);

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;

    li.append(p);
    feeds.push(li);
  });

  return feeds;
};

const createPosts = (state, i18n) => {
  const posts = [];

  state.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const a = document.createElement('a');
    a.setAttribute('href', post.link);
    a.setAttribute('data-id', post.id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');

    if (state.uiState.viewedPostIds.has(post.id)) {
      a.classList.add('fw-normal');
    } else {
      a.classList.add('fw-bold');
    }

    a.textContent = post.title;

    const button = createButton(post, i18n);

    li.append(a);
    li.append(button);

    posts.push(li);
  });
  return posts;
};

const createList = (itemsType, state, i18n) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t(`items.${itemsType}`);

  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  cardBody.append(cardTitle);
  card.append(cardBody);

  switch (itemsType) {
    case 'feeds':
      list.append(...createFeeds(state));
      break;
    case 'posts':
      list.append(...createPosts(state, i18n));
      break;
    default:
      break;
  }

  card.append(list);
  return card;
};

const renderFeeds = (state, { feedsList }, i18n) => {
  feedsList.innerHTML = '';
  const feeds = createList('feeds', state, i18n);
  feedsList.append(feeds);
};

const renderPosts = (state, { postsList }, i18n) => {
  postsList.innerHTML = '';
  const posts = createList('posts', state, i18n);
  postsList.append(posts);
};

const renderDispayedPost = (state, { modalHeader, modalBody, modalHref }) => {
  const currentId = state.uiState.displayedPost;
  const posts = state.posts.filter((post) => post.id === currentId);
  const [{ title, description, link }] = posts;
  modalHeader.textContent = title;
  modalBody.textContent = description;
  modalHref.setAttribute('href', link);
};

const renderSending = ({ form, input, feedback }, i18n) => {
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-warning');
  feedback.textContent = i18n.t('status.sending');
  form.reset();
  form.focus();
};

const renderSuccess = ({ form, input, feedback }, i18n) => {
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-warning');
  feedback.classList.add('text-success');
  feedback.textContent = i18n.t('status.successUrl');
  form.reset();
  form.focus();
};

const renderInvalid = ({ input, feedback }) => {
  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.remove('text-warning');
  feedback.classList.add('text-danger');
};

const renderProcessState = (elements, state, i18n) => {
  switch (state.loadingProcess.status) {
    case 'sending':
      renderSending(elements, i18n);
      break;

    case 'success':
      renderSuccess(elements, i18n);
      break;

    case 'invalid':
      renderInvalid(elements);
      break;

    default:
      break;
  }
};

export default (elements, i18n, state) => onChange(state, (path) => {
  switch (path) {
    case 'loadingProcess.status':
      renderProcessState(elements, state, i18n);
      break;

    case 'loadingProcess.error':
      renderErrors(state, elements, i18n);
      break;

    case 'posts':
    case 'uiState.viewedPostIds':
      renderPosts(state, elements, i18n);
      break;

    case 'feeds':
      renderFeeds(state, elements, i18n);
      break;

    case 'uiState.displayedPost':
      renderDispayedPost(state, elements);
      break;

    default:
      break;
  }
});
