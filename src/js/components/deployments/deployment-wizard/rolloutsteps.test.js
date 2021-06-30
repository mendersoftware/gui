import React from 'react';
import { render } from '@testing-library/react';
import RolloutSteps from './rolloutsteps';
import { undefineds } from '../../../../../tests/mockData';

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
