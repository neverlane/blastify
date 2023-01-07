import { Window } from 'happy-dom';

export const createWindow = (html: string) => {
  const window = new Window();
  window.document.body.innerHTML = html;
  return window;
};