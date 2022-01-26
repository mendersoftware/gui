import React from 'react';
import Tooltip from './mendertooltip';
import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';

describe('Loader Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Tooltip title="sudo it all!" open>
        <div>test</div>
      </Tooltip>
    );
    const view = baseElement;
    console.log(view.innerHTML);
    expect(view.innerHTML.includes('WithStyles(ForwardRef(Tooltip))')).toBeTruthy();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
