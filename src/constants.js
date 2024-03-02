export const initialState = {
  form: {
    isValid: false,
    error: '',
  },
  loadingProcess: {
    status: 'filling',
    error: '',
  },
  feeds: [],
  posts: [],
  uiState: {
    displayedPost: null,
    viewedPostIds: new Set(),
  },
};

export const customErrors = {
  string: {
    url: () => 'urlError',
    required: () => 'empty',
  },
  mixed: {
    notOneOf: () => 'dublicateError',
  },
};

export const updateTime = 5000;

export const updateRequest = 10000;
