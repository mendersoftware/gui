import React from 'react';
import PropTypes from 'prop-types';
import Time from 'react-time';
import AppActions from '../../actions/app-actions';
import ReactTooltip from 'react-tooltip';
import { UploadArtifact, ExpandArtifact } from '../helptips/helptooltips';
import Loader from '../common/loader';
import SearchInput from 'react-search-input';
import SelectedArtifact from './selectedartifact';
import Dropzone from 'react-dropzone';

// material ui
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';

import FileIcon from '@material-ui/icons/CloudUpload';
import HelpIcon from '@material-ui/icons/Help';
import SortIcon from '@material-ui/icons/Sort';

import { preformatWithRequestID, formatTime } from '../../helpers';

const columnHeaders = [
  { title: 'Name', name: 'name', sortable: true },
  { title: 'Device type compatibility', name: 'device_types', sortable: false },
  { title: 'Last modified', name: 'modified', sortable: true },
  { title: 'Type', name: 'type', sortable: false }
];

export default class Repository extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      artifact: {
        name: null,
        description: null,
        device_types: null
      },
      sortCol: 'name',
      sortDown: true,
      upload: false,
      popupLabel: 'Upload a new artifact',
      artifacts: this.props.artifacts,
      tmpFile: null,
      divHeight: 178
    };
  }

  componentWillReceiveProps(nextProps) {
    let state = { artifacts: nextProps.artifacts };
    if (nextProps.selected) {
      state.artifact = nextProps.selected;
    }
    this.setState(state);
  }

  _resetArtifactState() {
    var artifact = {
      name: null,
      description: null,
      device_types: null
    };
    this.setState({ artifact: artifact });
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

    this._resetArtifactState();
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

  _onRowSelection(artifact) {
    if (this.state.artifact === artifact) {
      this._resetArtifactState();
    } else {
      this.setState({ artifact });
    }
  }
  _sortColumn(col) {
    if (!col.sortable) {
      return;
    }
    this.setState({
      sortDown: !this.state.sortDown,
      sortCol: col.name
    });
    // sort table
    AppActions.sortTable('_artifactsRepo', col.name, this.state.sortDown);
  }
  searchUpdated() {
    this.setState({ artifact: {} }); // needed to force re-render
  }

  _adjustCellHeight(height) {
    this.setState({ divHeight: height + 110 });
  }
  _handleRemove() {
    // pass artifact to be removed up to parent to trigger dialog
    this.props.removeArtifact(this.state.artifact);
  }
  render() {
    const self = this;
    var tmpArtifacts = [];
    if (self.search) {
      var filters = ['name', 'device_types_compatible', 'description'];
      tmpArtifacts = self.state.artifacts.filter(self.search.filter(filters));
    }
    const columnWidth = `${100 / columnHeaders.length}%`;
    var items = tmpArtifacts.map(function(pkg, index) {
      var compatible = pkg.device_types_compatible.join(', ');
      const expanded = self.state.artifact.id === pkg.id;
      const artifactType = pkg.updates.reduce((accu, item) => (accu ? accu : item.type_info.type), '');
      const columnStyle = { width: columnWidth };
      return (
        <ExpansionPanel square expanded={expanded} key={index} onChange={() => self._onRowSelection(pkg)}>
          <ExpansionPanelSummary>
            <div style={columnStyle}>{pkg.name}</div>
            <div style={columnStyle}>{compatible}</div>
            <Time value={formatTime(pkg.modified)} format="YYYY-MM-DD HH:mm" style={columnStyle} />
            <div style={Object.assign({}, columnStyle, { maxWidth: '100vw' })}>{artifactType}</div>
            <IconButton className="expandButton" onClick={() => self._onRowSelection(pkg)}>
              <Icon className="material-icons">{expanded ? 'arrow_drop_up' : 'arrow_drop_down'}</Icon>
            </IconButton>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <SelectedArtifact
              removeArtifact={() => self._handleRemove()}
              compatible={compatible}
              formatTime={formatTime}
              editArtifact={self._editArtifactData}
              artifact={self.state.artifact}
            />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      );
    });

    return (
      <div>
        <div className={items.length ? 'top-right-button fadeIn' : 'top-right-button fadeOut'}>
          <Dropzone
            disabled={this.props.progress > 0}
            activeClassName="active"
            rejectClassName="active"
            multiple={false}
            accept=".mender"
            onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="dropzone onboard dashboard-placeholder">
                <input {...getInputProps()} />
                <div className="icon inline-block">
                  <FileIcon style={{ height: '24px', width: '24px', verticalAlign: 'middle', marginTop: '-2px' }} />
                </div>
                <div className="dashboard-placeholder inline">
                  Drag here or <a>browse</a> to upload an artifact file
                </div>
              </div>
            )}
          </Dropzone>
        </div>

        <div>
          <h3 className="inline-block">Available artifacts</h3>
          <SearchInput
            placeholder="Search artifacts"
            className="search tableSearch"
            ref={search => (self.search = search)}
            onChange={() => self.searchUpdated()}
          />
        </div>

        <div id="progressBarContainer" className={self.props.progress ? null : 'shrunk'}>
          <p className="align-center">Upload in progress ({Math.round(self.props.progress)}%)</p>
          <LinearProgress variant="determinate" style={{ backgroundColor: '#c7c7c7', margin: '15px 0' }} value={self.props.progress || 0} />
        </div>

        <Loader show={self.props.loading} />

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
          {self.props.showHelptips && items.length ? (
            <div>
              <div id="onboard-10" className="tooltip help" data-tip data-for="artifact-expand-tip" data-event="click focus">
                <HelpIcon />
              </div>
              <ReactTooltip id="artifact-expand-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                <ExpandArtifact />
              </ReactTooltip>
            </div>
          ) : null}

          <div className={items.length || self.props.loading || self.props.progress ? 'hidden' : 'dashboard-placeholder fadeIn'}>
            <Dropzone
              disabled={self.props.progress > 0}
              activeClassName="active"
              rejectClassName="active"
              multiple={false}
              accept=".mender"
              onDrop={(accepted, rejected) => self.onDrop(accepted, rejected)}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className="dropzone onboard dashboard-placeholder">
                  <input {...getInputProps()} />
                  <p style={{ width: '500px', fontSize: '16px', margin: 'auto' }}>
                    No artifacts found. Drag a file here or <a>browse</a> to upload to the repository
                  </p>
                  <img src="assets/img/artifacts.png" alt="artifacts" />
                </div>
              )}
            </Dropzone>
            {this.props.showHelptips ? (
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
        </div>
      </div>
    );
  }
}
