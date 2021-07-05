import React from 'react';
import { render } from '@testing-library/react';
import Tooltip from './mendertooltip';
import { undefineds } from '../../../../tests/mockData';

describe('Loader Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Tooltip title="sudo it all!" open>
        <div>test</div>
      </Tooltip>
    );
    const view = baseElement;
    expect(view.innerHTML.includes('WithStyles(ForwardRef(Tooltip))')).toBeTruthy();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
