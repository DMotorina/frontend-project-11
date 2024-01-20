export const initialState = {
  form: {
    processState: '',
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
