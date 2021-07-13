import React from 'react';
import { render } from '@testing-library/react';
import MoreHelp from './more-help-resources';
import { helpProps } from './mockData';
import { undefineds } from '../../../../tests/mockData';

describe('MoreHelp Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<MoreHelp {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
