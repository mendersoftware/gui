import React from 'react';
import renderer from 'react-test-renderer';
import CopyCode from './copy-code';

describe('CopyCode Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<CopyCode code="sudo it all!" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
