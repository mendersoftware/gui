import React from 'react';
import { render } from '@testing-library/react';
import QuoteRequestForm from './quoterequestform';
import { undefineds } from '../../../../tests/mockData';

describe('QuoteRequestForm component', () => {
  it(`renders correctly`, () => {
    const { baseElement } = render(<QuoteRequestForm addOns={[]} onSendMessage={jest.fn} updatedPlan="enterprise" notification="something notify" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
