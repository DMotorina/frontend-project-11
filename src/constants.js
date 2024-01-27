export const initialState = {
  form: {
    // processState: 'filling',
    isValid: null,
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

export default {};
