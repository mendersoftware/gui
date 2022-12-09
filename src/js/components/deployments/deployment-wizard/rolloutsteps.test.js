import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import RolloutSteps from './rolloutsteps';

describe('RolloutSteps Component', () => {
  it('renders correctly', async () => {
    let tree = render(<RolloutSteps isEnterprise onStepChange={jest.fn} steps={[]} />);
    let view = tree.baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));

    tree = render(<RolloutSteps isEnterprise steps={[]} />);
    view = tree.baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));

    tree = render(<RolloutSteps disabled steps={[]} />);
    view = tree.baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
