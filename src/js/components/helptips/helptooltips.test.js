import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { AuthButton, ExpandArtifact, ExpandDevice, AddGroup } from './helptooltips';

describe('AuthButton', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <AuthButton />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('ExpandArtifact', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ExpandArtifact />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('ExpandDevice', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ExpandDevice />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('AddGroup', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AddGroup />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
