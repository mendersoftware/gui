import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import InfoHint from './info-hint';

describe('InfoHint Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<InfoHint content="test" className="test-class" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
