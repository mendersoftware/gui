import React from 'react';
import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Alert from './alert';

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
