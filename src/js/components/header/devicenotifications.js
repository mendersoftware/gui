import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

// material ui
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';

export default class DeviceNotifications extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {
    var approaching = this.props.limit && this.props.total / this.props.limit > 0.8;
    var warning = this.props.limit && this.props.limit <= this.props.total;
    return (
      <div>
        <div id="limit" data-tip data-for="limit-tip" data-offset="{'bottom': 0, 'right': 0}" data-tip-disable={!this.props.limit}>
          <ReactTooltip
            id="limit-tip"
            globalEventOff="click"
            place="bottom"
            type="light"
            effect="solid"
            delayHide={1500}
            className="react-tooltip"
            disabled={!this.props.limit}
          >
            <h3>Device limit</h3>
            {approaching || warning ? (
              <p>You {approaching ? <span>have reached</span> : <span>are nearing</span>} your device limit.</p>
            ) : (
              <p>
                You can still connect another {this.props.limit - this.props.total} {pluralize('devices', this.props.limit - this.props.total)}.
              </p>
            )}
            <p>
              Contact us by email at <a href="mailto:support@hosted.mender.io">support@hosted.mender.io</a> to request a higher limit.
            </p>
            <p>There is no fee for a higher limit; the purpose of the limit is to allow us to plan capacity for scaling Hosted Mender.</p>
            <p>Billing is based on your usage only. See <a href="https://mender.io/pricing" target="_blank">pricing</a> for an overview.</p>
          </ReactTooltip>

          <div className="header-section">
            <Link to="/devices" className={warning ? 'warning inline' : approaching ? 'approaching inline' : 'inline'}>
              <span>{this.props.total}</span>
              {this.props.limit ? <span>/{this.props.limit}</span> : null}

              <DeveloperBoardIcon style={{ margin: '0 7px 0 10px', fontSize: '20px' }} />
            </Link>

            {this.props.pending ? (
              <Link
                to="/devices/pending"
                style={{ marginLeft: '7px' }}
                className={this.props.limit && this.props.limit < this.props.pending + this.props.total ? 'warning' : null}
              >
                {this.props.pending} pending
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
