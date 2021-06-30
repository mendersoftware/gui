import React from 'react';
import { render } from '@testing-library/react';
import PhaseSettings from './phasesettings';
import { undefineds } from '../../../../../tests/mockData';

describe('PhaseSettings Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<PhaseSettings deploymentObject={{ phases: [{ batch_size: 0 }] }} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
