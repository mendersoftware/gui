import React from 'react';
import Dropzone from 'react-dropzone';
import ReactTooltip from 'react-tooltip';

// material ui
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import FileIcon from '@material-ui/icons/CloudUpload';
import HelpIcon from '@material-ui/icons/Help';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import SortIcon from '@material-ui/icons/Sort';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import { preformatWithRequestID, customSort } from '../../helpers';
import { UploadArtifact, ExpandArtifact } from '../helptips/helptooltips';
import Loader from '../common/loader';
import ReleaseRepositoryItem from './releaserepositoryitem';

const columnHeaders = [
  { title: 'Device type compatibility', name: 'device_types', sortable: false },
  { title: 'Last modified', name: 'modified', sortable: true },
  { title: 'Type', name: 'type', sortable: false },
  { title: 'Signed', name: 'signed', sortable: true }
];

export default class ReleaseRepository extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedArtifact: this.props.artifact || { id: null },
      sortCol: 'modified',
      sortDown: true,
      upload: false,
      popupLabel: 'Upload a new artifact',
      tmpFile: null
    };
  }

  onDrop(acceptedFiles, rejectedFiles) {
    if (acceptedFiles.length) {
      this._onUploadSubmit(acceptedFiles);
    }
    if (rejectedFiles.length) {
      AppActions.setSnackbar(`File '${rejectedFiles[0].name}' was rejected. File must be of type .mender`, null);
    }
  }
  _onUploadSubmit(files) {
    var self = this;
    //var tmpFile = meta.artifactFile;
    //delete meta.artifactFile;
    //delete meta.verified;
    var meta = { description: '' };
    const uploads = files.map(file => self.props.uploadArtifact(meta, file));
    Promise.all(uploads).then(() => self.props.refreshArtifacts());
  }

  _onRowSelection(artifact) {
    if (this.state.selectedArtifact === artifact) {
      this.setState({ selectedArtifact: { id: null } });
    } else {
      this.setState({ selectedArtifact: artifact });
    }
  }

  _editArtifactData(id, description) {
    var self = this;
    var body = {
      description: description
    };
    return AppActions.editArtifact(id, body)
      .then(() => {
        AppActions.setSnackbar('Artifact details were updated successfully.', 5000, '');
        var updated = self.state.selectedArtifact;
        updated.description = description;
        self.setState({ selectedArtifact: updated });
        self.props.refreshArtifacts();
      })
      .catch(err => {
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(errMsg, `Artifact details couldn't be updated. ${err.error}`), null, 'Copy to clipboard');
      });
  }

  _sortColumn(col) {
    if (!col.sortable) {
      return;
    }
    // sort table
    this.setState({ sortDown: !this.state.sortDown, sortCol: col.name });
  }

  render() {
    const self = this;
    const { artifacts, loading, release, removeArtifact, showHelptips } = self.props;
    const { selectedArtifact, sortDown, sortCol } = self.state;
    const columnWidth = `${100 / columnHeaders.length}%`;
    const items = artifacts.sort(customSort(sortDown, sortCol)).map((pkg, index) => {
      const expanded = selectedArtifact.id === pkg.id;
      return (
        <ReleaseRepositoryItem
          key={`repository-item-${index}`}
          artifact={pkg}
          expanded={expanded}
          index={index}
          onEdit={(id, description) => self._editArtifactData(id, description)}
          onRowSelection={() => self._onRowSelection(pkg)}
          removeArtifact={removeArtifact}
          release={release}
          width={columnWidth}
        />
      );
    });

    const uploading = AppStore.getUploadInProgress();
    const dropzoneClass = uploading ? 'dropzone disabled muted' : 'dropzone';

    var emptyLink = (
      <Dropzone
        disabled={uploading}
        activeClassName="active"
        rejectClassName="active"
        multiple={false}
        accept=".mender"
        onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps({ className: dropzoneClass })}>
            <input {...getInputProps()} disabled={uploading} />
            <p>
              There are no Releases yet. <a>Upload an Artifact</a> to create a new Release
            </p>
          </div>
        )}
      </Dropzone>
    );
    const noArtifactsClass = release ? '' : 'muted';
    return (
      <div className="relative release-repo margin-left" style={{ width: '100%' }}>
        <div className="flexbox">
          <KeyboardArrowRightIcon className={noArtifactsClass} />
          <div className={noArtifactsClass}>
            <Typography variant="body2" style={release ? { fontWeight: 'bold', marginBottom: '30px' } : { marginBottom: '30px' }}>
              {release ? release.Name : 'No release selected'}
            </Typography>
            <Typography variant="body1">Artifacts in this release:</Typography>
          </div>
        </div>

        <Dropzone
          disabled={uploading}
          activeClassName="active"
          rejectClassName="active"
          multiple={false}
          accept=".mender"
          onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ className: `dashboard-placeholder top-right-button fadeIn onboard ${dropzoneClass}`, style: { top: 0 } })}>
              <input {...getInputProps()} disabled={uploading} />
              <span className="icon">
                <FileIcon style={{ height: '24px', width: '24px', verticalAlign: 'middle', marginTop: '-2px', marginRight: '10px' }} />
              </span>
              <span>
                Drag here or <a>browse</a> to upload an artifact file
              </span>
            </div>
          )}
        </Dropzone>

        <Loader show={loading} />

        <div style={{ position: 'relative', marginTop: '10px' }}>
          {items.length ? (
            <div>
              <div className="flexbox inventoryTable">
                {columnHeaders.map(item => (
                  <Tooltip
                    key={item.name}
                    className="columnHeader"
                    title={item.title}
                    placement="top-start"
                    style={{ width: columnWidth }}
                    onClick={() => self._sortColumn(item)}
                  >
                    <div>
                      {item.title}
                      {item.sortable ? (
                        <SortIcon className={`sortIcon ${self.state.sortCol === item.name ? 'selected' : ''} ${self.state.sortDown.toString()}`} />
                      ) : null}
                    </div>
                  </Tooltip>
                ))}
                <div style={{ width: 48 }} />
              </div>
              {items}
            </div>
          ) : null}
          {showHelptips && items.length ? (
            <div>
              <div id="onboard-10" className="tooltip help" data-tip data-for="artifact-expand-tip" data-event="click focus">
                <HelpIcon />
              </div>
              <ReactTooltip id="artifact-expand-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                <ExpandArtifact />
              </ReactTooltip>
            </div>
          ) : null}

          {items.length || loading ? null : (
            <div className="dashboard-placeholder fadeIn" style={{ fontSize: '16px', margin: '8vh auto' }}>
              <div>{this.props.hasReleases ? <p>Select a Release on the left to view its Artifact details</p> : emptyLink}</div>
              {showHelptips ? (
                <div>
                  <div id="onboard-9" className="tooltip help highlight" data-tip data-for="artifact-upload-tip" data-event="click focus">
                    <HelpIcon />
                  </div>
                  <ReactTooltip id="artifact-upload-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                    <UploadArtifact />
                  </ReactTooltip>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }
}
