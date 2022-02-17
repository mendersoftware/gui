import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import PhaseSettings from './phasesettings';

describe('PhaseSettings Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<PhaseSettings deploymentObject={{ phases: [{ batch_size: 0 }] }} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
