import React from 'react';
import { render } from '@testing-library/react';
import Form from './form';
import { undefineds } from '../../../../../tests/mockData';

describe('Form Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Form showButtons={true} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
