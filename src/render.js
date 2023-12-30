import view from './view';

export default (i18nextInstance) => {
  const elements = {
    form: document.querySelector('.rss-form.text-body'),
    inputField: document.querySelector('#url-input'),
    submitButton: document.querySelector('.h-100.btn.btn-lg.btn-primary.px-sm-5'),
  };

  const init = () => ({
    formValue: elements.inputField.value,
    links: [],
    i18n: i18nextInstance,
  });

  const state = init();

  elements.inputField.addEventListener('input', () => {
    state.formValue = elements.inputField.value;
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const URL = elements.inputField.value;
    view(elements, state, URL);
  });
};
