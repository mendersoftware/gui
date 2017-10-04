import React from 'react';
import cookie from 'react-cookie';
import CopyToClipboard from 'react-copy-to-clipboard';
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
              primaryText="Name"
              disabled={true}
              secondaryText={this.state.org.name} />
            <Divider />
            <div className="material-list-item">
              <h4>Token</h4>
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