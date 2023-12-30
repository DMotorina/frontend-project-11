import * as yup from 'yup';
import ru from './locales/ru';

const validationSchema = yup.object().shape({
  URL: yup.string().url().required(),
});

const feedbackElement = document.querySelector('.feedback');

export default async (elements, state, URL) => new Promise((resolve) => {
  validationSchema.validate({ URL }).then(() => {
    if (state.links.includes(URL)) {
      elements.inputField.style.borderColor = 'red';
      feedbackElement.textContent = ru.translation.alreadyInList;
    } else {
      feedbackElement.textContent = ru.translation.success;
      state.links.push(URL);
      elements.inputField.value = '';
      elements.inputField.focus();
      resolve();
    }
  }).catch((error) => {
    feedbackElement.textContent = ru.translation.notUrl;
    elements.inputField.classList.add('error');
    elements.inputField.style.borderColor = 'red';
  });
});
