export const initialState = {
  form: {
    processState: 'filling',
    error: null,
  },
  feeds: [],
  posts: [],
  uiState: {
    displayedPost: null,
    viewedPostIds: new Set(),
  },
};

export default {};
