import React from 'react';
import cookie from 'react-cookie';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
var AppActions = require('../../actions/app-actions');
var createReactClass = require('create-react-class');

// material ui
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

var MyOrganization = createReactClass({
  getInitialState: function() {
    return {
      org: {
        tenant_token: ''
      },
      copied: false,
    };
  },
  componentDidMount: function() {
    this._getUserOrganization();
  },
  _getUserOrganization: function() {
    var self = this;
    var callback = {
      success: function(org) {
        self.setState({org: org});
      },
      error: function(err) {
        console.log("Error: " +err);
      }
    };
    AppActions.getUserOrganization(callback);
  },
  _copied: function() {
    var self = this;
    self.setState({copied: true});
    setTimeout(function() {
      self.setState({copied: false});
    }, 5000);
  },
  render: function () {
    return (
     
      <div style={{maxWidth: "750px"}} className="margin-top-small">
        
        <h2 style={{marginTop: "15px"}}>My organization</h2>
          
       {
        this.state.org ?
        <div>
          <List>
            <ListItem
              key="name"
              primaryText="Organization name"
              disabled={true}
              secondaryText={this.state.org.name} />
            <Divider />
            <div className="material-list-item">
              <h4 style={{display: "inline", paddingRight: "10px"}}>Token</h4>

              <div
                id="token-info"
                className="tooltip info"
                data-tip
                style={{position: "relative", display:"inline", top:"6px"}}
                data-for='token-help'
                data-event='click focus'>
                <FontIcon className="material-icons">info</FontIcon>
              </div>
              <ReactTooltip
                id="token-help"
                globalEventOff='click'
                place="top"
                type="light"
                effect="solid"
                style={{}}
                className="react-tooltip">
                
                <h3>Tenant token</h3>
                <p style={{color: "#DECFD9", margin: "1em 0"}}>This token is unique for your organization and ensures that only devices that you own are able to connect to your account.</p>
                <p style={{color: "#DECFD9", margin: "1em 0"}}>Set this variable in <i>local.conf</i> in order to make the device recognize the organization to which it belongs.</p>
              </ReactTooltip>

              <p style={{wordBreak: "break-all"}}>{this.state.org.tenant_token}</p>
             
              <CopyToClipboard text={this.state.org.tenant_token}
                onCopy={() => this._copied()}>
                <FlatButton
                  label="Copy to clipboard"
                  style={{marginTop: "15px"}}
                  icon={<FontIcon className="material-icons">content_paste</FontIcon>} />
              </CopyToClipboard>
            
              <p style={{marginLeft:"14px"}}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
            </div>
            <Divider />
          </List>
        </div>
        : null
       }
      </div>
    )
  }
});


module.exports = MyOrganization;