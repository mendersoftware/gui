import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Tooltip from './mendertooltip';

describe('Loader Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Tooltip title="sudo it all!" open>
        <div>test</div>
      </Tooltip>
    );
    const view = baseElement.lastChild;
    expect(view.textContent).toContain('sudo it all');
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
