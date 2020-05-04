import React from 'react';
import renderer from 'react-test-renderer';
import AcceptedDevices from './accepteddevices';
import { undefineds } from '../../../../../tests/mockData';

describe('AcceptedDevices Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AcceptedDevices />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
