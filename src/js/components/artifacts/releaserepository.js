import React from 'react';
import Time from 'react-time';
import AppActions from '../../actions/app-actions';
import ReactTooltip from 'react-tooltip';
import { UploadArtifact, ExpandArtifact } from '../helptips/helptooltips';
import Loader from '../common/loader';
import SelectedArtifact from './selectedartifact';
import Dropzone from 'react-dropzone';

// material ui
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import FileIcon from '@material-ui/icons/CloudUpload';
import HelpIcon from '@material-ui/icons/Help';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import SortIcon from '@material-ui/icons/Sort';

import { preformatWithRequestID, formatTime, customSort } from '../../helpers';

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
      artifact: this.props.artifact || { id: null },
      sortCol: 'modified',
      sortDown: true,
      upload: false,
      popupLabel: 'Upload a new artifact',
      tmpFile: null,
      artifacts: this.props.release ? this.props.release.Artifacts : []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.release !== this.props.release) {
      this.setState({ artifacts: nextProps.release ? nextProps.release.Artifacts : [] });
    }
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
    files.forEach(file => {
      self.props.uploadArtifact(meta, file);
    });
  }

  _onRowSelection(artifact) {
    if (this.state.artifact === artifact) {
      this.setState({ artifact: { id: null } });
    } else {
      this.setState({ artifact });
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
        var updated = self.state.artifact;
        updated.description = description;
        self.setState({ artifact: updated });
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
    const sortedArtifacts = this.props.release.Artifacts.sort(customSort(!this.state.sortDown, col.name));
    this.setState({ artifacts: sortedArtifacts, sortDown: !this.state.sortDown, sortCol: col.name });
  }

  render() {
    const self = this;
    const { loading, progress, release, showHelptips } = self.props;
    const columnWidth = `${100 / columnHeaders.length}%`;
    var items = this.state.artifacts.map((pkg, index) => {
      var compatible = pkg.device_types_compatible.join(', ');
      const expanded = self.state.artifact.id === pkg.id;
      const artifactType = pkg.updates.reduce((accu, item) => (accu ? accu : item.type_info.type), '');
      const columnStyle = { width: columnWidth };
      return (
        <div className="flexbox release-repo-item" key={index}>
          <div className="muted">{index + 1}</div>
          <ExpansionPanel
            square
            expanded={expanded}
            onChange={() => self._onRowSelection(pkg)}
            style={{ width: '100%', border: '1px solid', borderColor: '#e0e0e0' }}
          >
            <ExpansionPanelSummary style={{ padding: '0 12px' }}>
              <div style={columnStyle}>{compatible}</div>
              <Time value={formatTime(pkg.modified)} format="YYYY-MM-DD HH:mm" style={columnStyle} />
              <div style={Object.assign({}, columnStyle, { maxWidth: '100vw' })}>{artifactType}</div>
              <div style={columnStyle}>{pkg.signed ? <CheckCircleOutlineIcon className="green" /> : '-'}</div>
              <IconButton className="expandButton" onClick={() => self._onRowSelection(pkg)}>
                <Icon className="material-icons">{expanded ? 'arrow_drop_up' : 'arrow_drop_down'}</Icon>
              </IconButton>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <SelectedArtifact
                removeArtifact={self.props.removeArtifact}
                formatTime={formatTime}
                editArtifact={self._editArtifactData}
                artifact={self.state.artifact}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
      );
    });

    var emptyLink = (
      <Dropzone
        disabled={progress > 0}
        activeClassName="active"
        rejectClassName="active"
        multiple={false}
        accept=".mender"
        onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>
              There are no Releases yet. <a>Upload an Artifact</a> to create a new Release
            </p>
          </div>
        )}
      </Dropzone>
    );

    const noArtifactsClass = release ? '' : 'muted';
    return (
      <div className="relative release-repo margin-left" style={{ width: '100%'}}>
        <div className="flexbox">
          <KeyboardArrowRightIcon className={noArtifactsClass} />
          <div className={noArtifactsClass}>
            <Typography variant="body2" style={release ? {fontWeight: 'bold', marginBottom: '30px'} : {marginBottom: '30px'} }>
              {release ? release.Name : 'No release selected'}
            </Typography>
            <Typography variant="body1">Artifacts in this release:</Typography>
          </div>
        </div>

        <Dropzone
          disabled={progress > 0}
          activeClassName="active"
          rejectClassName="active"
          multiple={false}
          accept=".mender"
          onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="dashboard-placeholder top-right-button fadeIn dropzone onboard" style={{ top: 0 }}>
              <input {...getInputProps()} />
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
              <div>
                { this.props.hasReleases ? <p>'Select a Release on the left to view its Artifact details'</p> : emptyLink }
              </div>
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
