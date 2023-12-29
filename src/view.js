import * as yup from 'yup';

const validationSchema = yup.object().shape({
  URL: yup.string().url().required(),
});

const container = document.querySelector('.container');
const message = document.createElement('p');
message.textContent = '';

const validURL = () => {
  message.textContent = 'RSS успешно загружен';
  container.append(message);
};

const inValidURL = () => {
  message.textContent = 'Ссылка должна быть валидным URL';
  container.append(message);
};

const existURL = () => {
  message.textContent = 'RSS уже существует';
  container.append(message);
};

export default async (elements, state, URL) => new Promise((resolve) => {
  validationSchema.validate({ URL }).then(() => {
    if (state.links.includes(URL)) {
      elements.inputField.style.borderColor = 'red';
      existURL();
    } else {
      validURL();
      state.links.push(URL);
      elements.inputField.value = '';
      elements.inputField.focus();
      resolve();
    }
  }).catch((error) => {
    inValidURL();
    elements.inputField.classList.add('error');
    elements.inputField.style.borderColor = 'red';
  });
});
