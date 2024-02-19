export const initialState = {
  form: {
    isValid: false,
    error: '',
  },
  loadingProcess: {
    status: 'filling',
    error: '',
    enteredUrls: new Set(),
  },
  feeds: [],
  posts: [],
  uiState: {
    displayedPost: null,
    viewedPostIds: new Set(),
  },
};

export default {};
