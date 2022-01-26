import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import QuoteRequestForm from './quoterequestform';

describe('QuoteRequestForm component', () => {
  it(`renders correctly`, () => {
    const { baseElement } = render(<QuoteRequestForm addOns={[]} onSendMessage={jest.fn} updatedPlan="enterprise" notification="something notify" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
