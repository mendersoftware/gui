import React from 'react';
import { render } from '@testing-library/react';
import Alert from './alert';
import { undefineds } from '../../../../tests/mockData';

describe('Alert Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Alert className="margin-top-small" severity="error">
        Content
      </Alert>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
