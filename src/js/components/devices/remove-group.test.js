import React from 'react';
import { render } from '@testing-library/react';
import RemoveGroup from './remove-group';
import { undefineds } from '../../../../tests/mockData';

describe('RemoveGroup Component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<RemoveGroup onClose={jest.fn} onRemove={jest.fn} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
