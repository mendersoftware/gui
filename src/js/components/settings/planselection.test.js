import React from 'react';
import { render } from '@testing-library/react';
import PlanSelection from './planselection';
import { undefineds } from '../../../../tests/mockData';

describe('PlanSelection component', () => {
  it(`renders correctly`, () => {
    const { baseElement } = render(<PlanSelection isUpgrade offerValid offerTag="very now" trial updatedPlan="enterprise" />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
