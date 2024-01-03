export default (data, watchedState, url) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data.contents, 'text/xml');
  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;
  const items = doc.querySelectorAll('item');

  const posts = [];

  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const pubDate = item.querySelector('pubDate').textContent;
    posts.push({
      title,
      description,
      link,
      pubDate,
    });
  });

  watchedState.form.parsed = {
    feed: {
      url,
      title: feedTitle,
      description: feedDescription,
    },
    posts,
  };

  watchedState.form.processState = 'success';
};
