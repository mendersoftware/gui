import React from 'react';
import renderer from 'react-test-renderer';
import PhaseSettings from './phasesettings';
import { undefineds } from '../../../../../tests/mockData';

describe('PhaseSettings Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<PhaseSettings phases={[{ batch_size: 0 }]} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
