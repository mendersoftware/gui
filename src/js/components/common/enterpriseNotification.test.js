import React from 'react';
import { render } from '@testing-library/react';
import EnterpriseNotification from './enterpriseNotification';
import { undefineds } from '../../../../tests/mockData';

describe('EnterpriseNotification Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<EnterpriseNotification benefit="a test benefit" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
