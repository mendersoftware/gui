import React from 'react';
import { render } from '@testing-library/react';
import FileTransfer from './filetransfer';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('FileTransfer Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <FileTransfer
        deviceId={defaultState.devices.byId.a1.id}
        downloadPath={''}
        onDownload={jest.fn}
        onUpload={jest.fn}
        setDownloadPath={jest.fn}
        setFile={jest.fn}
        setSnackbar={jest.fn}
        setUploadPath={jest.fn}
        uploadPath={''}
      />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
