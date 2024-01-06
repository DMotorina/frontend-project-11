export default class {
  constructor(data, url) {
    this.doc = (new DOMParser()).parseFromString(data, 'text/xml');
    this.url = url;
  }

  get posts() {
    return [...this.doc.querySelectorAll('item')].map((item) => ({
      link: item.querySelector('link').textContent,
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      date: item.querySelector('pubDate').textContent,
      id: item.querySelector('guid').textContent,
      feedId: this.url,
    }));
  }

  get feed() {
    return {
      id: this.url,
      title: this.doc.querySelector('title').textContent,
      description: this.doc.querySelector('description').textContent,
    };
  }
}
