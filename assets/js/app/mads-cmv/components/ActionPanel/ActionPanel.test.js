import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import ActionPanel from './ActionPanel';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('renders with or without a name', () => {
  act(() => {
    render(<ActionPanel />, container);
  });
  const buttons = container.querySelectorAll('button');

  expect(buttons[0].textContent).toBe('Setting');
  expect(buttons[1].textContent).toBe('Save');

  // console.log(buttons.length);
});

it('changes value when clicked', () => {
  const onChange = jest.fn();
  act(() => {
    render(<ActionPanel onChange={onChange} />, container);
  });

  // get ahold of the button element, and trigger some clicks on it
  const button = document.querySelector('[data-testid=setting]');
  expect(button.innerHTML).toBe('Setting');

  // act(() => {
  //   button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  // });

  // expect(onChange).toHaveBeenCalledTimes(1);
  // expect(button.innerHTML).toBe('Turn on');

  // act(() => {
  //   for (let i = 0; i < 5; i++) {
  //     button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  //   }
  // });

  // expect(onChange).toHaveBeenCalledTimes(6);
  // expect(button.innerHTML).toBe('Turn on');
});
