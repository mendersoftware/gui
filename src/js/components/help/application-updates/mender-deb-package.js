import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconButton from '@material-ui/core/IconButton';
import CopyPasteIcon from '@material-ui/icons/FileCopy';

export default class DebPackage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      dpkgCode: false,
      cpCode: false,
      echoCode: false,
      startCode: false,
      tenantCode: false,
    };
  }

  _copied(ref) {
    var self = this;
    var toSet = {};
    toSet[ref] = true;
    self.setState(toSet);
    setTimeout(() => {
      toSet[ref] = false;
      self.setState(toSet);
    }, 5000);
  }

  render() {

    var tenantToken = (this.props.org || {}).tenant_token;

    var dpkgCode = 'wget https://d1b0l86ne08fsf.cloudfront.net/mender/master/mender_master-1_armhf.deb \ndpkg -i mender-client_master-1_armhf.deb.deb';
    var cpCode = 'cp /etc/mender/mender.conf.demo /etc/mender/mender.conf';
    var echoCode = 'echo "device_type=generic-armv6" > /var/lib/mender/device_type';
    var startCode = 'systemctl enable mender && systemctl start mender';
    var tenantCode = 'TENANT_TOKEN="'+ tenantToken +'" \nsudo sed -i "s/'+ tenantToken +'/$TENANT_TOKEN/" /etc/mender/mender.conf';

    return (
      <div>
        <h2>Connecting your device using Mender .deb package</h2>
        <p>
         Mender is available as a .deb package, to make it easy to install and use Mender for application-based updates on Debian, Ubuntu and Raspbian OSes. We currently provide packages for:
        </p>
        <ul>
          <li>armhf (ARM-v6):
            <ul>
              <li>Raspberry Pi, BeagleBone and other ARM based devices.</li>
            </ul>
          </li>
        </ul>

        <h3>Installing and configuring the .deb package</h3>
        <p>
          On the device, run the following commands:
        </p>
        <p>Download the package:</p>
        <div className="code">
          <CopyToClipboard text={dpkgCode} onCopy={() => this._copied('dpkgCode')}>
            <IconButton style={{ float: 'right', margin: '-20px 0 0 10px' }}>
              <CopyPasteIcon/>
            </IconButton>
          </CopyToClipboard>
          <span style={{ wordBreak: 'break-word' }}>{dpkgCode}</span>
        </div>
        <p>{this.state.dpkgCode ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>

        <p>For demo purposes, copy the demo config file:</p>
        <div className="code">
          <CopyToClipboard text={cpCode} onCopy={() => this._copied('cpCode')}>
            <IconButton style={{ float: 'right', margin: '-20px 0 0 10px' }}>
              <CopyPasteIcon/>
            </IconButton>
          </CopyToClipboard>
          <span style={{ wordBreak: 'break-word' }}>{cpCode}</span>
        </div>
        <p>{this.state.cpCode ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
        <p>Or edit the config file yourself by <a href={`https://docs.mender.io/${this.props.docsVersion}client-configuration/configuration-file`} target="_blank">following the docs</a>.</p>
        
        <br/>

        {this.props.isHosted ? 
          <div>
            <h4>Configuration for Hosted Mender server</h4>
            <p>To configure the Mender client for Hosted Mender, you need to edit <span className="code">&#47;etc&#47;mender&#47;mender.conf</span> and insert your Tenant Token 
            where it says &quot;Paste your Hosted Mender token here&quot;.</p>

            <p>Set the TENANT_TOKEN variable and update the configuration file:
              <div className="code">
                <CopyToClipboard text={tenantCode} onCopy={() => this._copied('tenantCode')}>
                  <IconButton style={{ float: 'right', margin: '-20px 0 0 10px' }}>
                    <CopyPasteIcon/>
                  </IconButton>
                </CopyToClipboard>
                <span style={{ wordBreak: 'break-word' }}>{tenantCode}</span>              
              </div>
              <p>{this.state.tenantCode ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
              <br/>
            </p>
          </div> : null }
       
        <h4>Setting the device type</h4>
        <p>Set the device type on the device. This example uses <span className="code">generic-armv6</span>, but you can substitute your own specific device type:</p>
        <div className="code">
          <CopyToClipboard text={echoCode} onCopy={() => this._copied('echoCode')}>
            <IconButton style={{ float: 'right', margin: '-20px 0 0 10px' }} >
              <CopyPasteIcon/>
            </IconButton>
          </CopyToClipboard>
          <span style={{ wordBreak: 'break-word' }}>{echoCode}</span>
        </div>
        <p>{this.state.echoCode ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
        <br/>
        
        <h4>Starting the client</h4>
        <p>Enable and start the Mender client:</p>
        <div className="code">
          <CopyToClipboard text={startCode} onCopy={() => this._copied('startCode')}>
            <IconButton style={{ float: 'right', margin: '-20px 0 0 10px' }}>
              <CopyPasteIcon/>
            </IconButton>
          </CopyToClipboard>
          <span style={{ wordBreak: 'break-word' }}>{startCode}</span>
        </div>
        <p>{this.state.startCode ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
       
        <p>
          Once the client has started, your device will attempt to connect to the server. It will then appear in your Pending devices tab and you can continue.
        </p>

      </div>
    );
  }
}
