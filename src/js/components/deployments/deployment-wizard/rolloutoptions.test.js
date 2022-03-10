import React from 'react';
import RolloutOptions from './rolloutoptions';
import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';

describe('RolloutOptions Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<RolloutOptions isEnterprise={true} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly when enterprise is false', async () => {
    const { baseElement } = render(<RolloutOptions isEnterprise={false} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
