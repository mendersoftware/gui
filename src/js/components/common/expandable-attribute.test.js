import React from 'react';
import { render } from '@testing-library/react';
import ExpandableAttribute from './expandable-attribute';
import { undefineds } from '../../../../tests/mockData';

describe('ExpandableAttribute Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ExpandableAttribute />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
