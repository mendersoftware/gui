import React from 'react';
import { render } from '@testing-library/react';
import Distribution from './distribution';
import { undefineds } from '../../../../../tests/mockData';

describe('PendingDevices Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Distribution attribute="artifact_name" group="test" devices={{}} groups={{}} />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
