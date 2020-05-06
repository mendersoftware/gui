import React from 'react';
import renderer from 'react-test-renderer';
import MoreHelp from './more-help-resources';
import { helpProps } from './mockData';
import { undefineds } from '../../../../tests/mockData';

describe('MoreHelp Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<MoreHelp {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
