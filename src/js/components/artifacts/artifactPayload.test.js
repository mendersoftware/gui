import React from 'react';
import renderer from 'react-test-renderer';
import ArtifactPayload from './artifactPayload';
import { undefineds } from '../../../../tests/mockData';

describe('ArtifactPayload Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ArtifactPayload payload={{ files: null, type_info: { type: 'test' } }} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
