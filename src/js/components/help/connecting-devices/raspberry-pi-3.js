import React from 'react';
import PropTypes from 'prop-types';

var createReactClass = require('create-react-class');


var RaspberryPi =  createReactClass({

 
  render: function() {
    var version;
    var link = {};
    if (!this.props.isEmpty(this.props.links)) {

     var versions = Object.keys(this.props.links.links.raspberrypi3);
     if (versions.length >1) {
      version = this.props.getLatest(versions);
     } else {
      version = versions[0];
     }


      for (var fileName in this.props.links.links.raspberrypi3[version]) {
        if (fileName.indexOf('sdimg') != -1) {
          link = {name: fileName, href:this.props.links.links.raspberrypi3[version][fileName]};
        }
      }
    }
    
    return (
      <div>

        <h2>Raspberry Pi 3</h2>  

        <p>To make testing easy, we provide demo images you can test Mender with for the Raspberry Pi 3.</p>

        <p>The purpose of this is to make it easier for you to test Mender with a physical device. {this.props.isHosted ? <span>The demo images contain configuration specific for your Mender setup, so they will not work on other setups out of the box.</span> : null}</p>

        <p>If you would like to use a different device type, please see the <a onClick={this.props.changePage.bind(null, "help/connecting-devices/demo-artifacts")}>other demo images</a> or <a onClick={this.props.changePage.bind(null, "help/connecting-devices/build-with-yocto")}>Build with Yocto Project</a>.</p>

        <h3>Prerequisites</h3>

        <h4>A device to test with</h4>
        <p>One or more Raspberry Pi 3 devices.</p>

        <h4>Internet connectivity</h4>
        <p>An Ethernet cable connection for your device(s) that provides DHCP and allows internet access over TLS/443.</p>


        <h3>Download the disk image</h3>

        {!this.props.isEmpty(link) ? 
          <p><a href={link.href}>Download the correct disk image for Raspberry Pi 3 here</a>.</p>
          :
          <p>Download the correct disk image for Raspberry Pi 3 from <a href="https://docs.mender.io/getting-started/download-test-images" target="_blank">the downloads page</a>.</p>
        }

        <p>After the image has been downloaded, unpack it:</p>

        <div className="code">{'gunzip <PATH-TO-YOUR-DISK-IMAGE>.sdimg.gz'}</div>

        <h3>Write the disk image to the SD card</h3>

        <p>Insert the SD card of your device into your workstation.</p>

        <p>Find the path to the device where your SD card is placed on your workstation.</p>
        <p>Normally this will be <span className="code">/dev/mmcblk0</span> or <span className="code">/dev/sdb</span>. If you are unsure about its location, refer to these tutorials for <a href="https://www.raspberrypi.org/documentation/installation/installing-images/linux.md" target="_blank">Linux</a>, <a href="https://www.raspberrypi.org/documentation/installation/installing-images/mac.md" target="_blank">Mac OS</a> or <a href="https://www.raspberrypi.org/documentation/installation/installing-images/windows.md" target="_blank">Windows</a>.</p>

        <p>When you know the correct device for the SD card, set it and your disk image in shell variables and write it with the following commands:</p>

        <div className="code">
          <p>{'SD_CARD_DEVICE=<YOUR-SD-CARD-DEVICE>'}</p>
          <p>{'PATH_TO_DISK_IMAGE=<PATH-TO-YOUR-DISK-IMAGE>.sdimg'}</p>
          <p>sudo dd if=$PATH_TO_DISK_IMAGE of=$SD_CARD_DEVICE bs=1M && sudo sync</p>
        </div>
        <p>This may take a few minutes complete; wait until the command returns.</p>


        <h3>Boot the device</h3>

        <p>Connect your device to Ethernet network and insert the SD card into the device.</p>

        <p>Now connect the device to power so it boots up.</p>

        <p>Wait for 3-4 minutes until the device has fully booted and the Mender client has been able to connect to the Mender server.</p>
        <p>You should see your device pending in the <a onClick={this.props.changePage.bind(null, "devices")}>Devices tab</a>. Simply Authorize the pending device.</p>

        <p>If you cannot see any new device after 10 minutes, please verify that the network connection is working, and feel free to reach out for help with diagnostics via <a onClick={this.props.changePage.bind(null, "help/more-help-resources")}>our further Help resources</a>.</p>
      </div>
    )
  }
});


module.exports = RaspberryPi;