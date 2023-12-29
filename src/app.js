import view from './view';

export default () => {
  const elements = {
    container: document.querySelector('.container'),
    form: document.querySelector('.form-body'),
    inputField: document.querySelector('.form-control'),
    submitButton: document.querySelector('.form-submit'),
  };

  const init = () => ({
    formValue: elements.inputField.value,
    existingURL: {},
    validationStatus: 'success',
    getRssStatus: '',
    getRssSuccessText: '',
    getRssError: '',
    links: [],
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
