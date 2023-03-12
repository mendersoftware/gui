import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import PlanSelection from './planselection';

describe('PlanSelection component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<PlanSelection isUpgrade offerValid offerTag="very now" trial updatedPlan="enterprise" />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
