import React from 'react';
import PropTypes from 'prop-types';

var createReactClass = require('create-react-class');


var BeagleBoneBlack =  createReactClass({

 
  render: function() {
    var version = "1.2.1";
    var link = {};
    if (!this.props.isEmpty(this.props.links)) {
      for (var fileName in this.props.links.links.beaglebone[version]) {
        if (fileName.indexOf('sdimg') != -1) {
          link = {name: fileName, href:this.props.links.links.beaglebone[version][fileName]};
        }
      }
    }
    
    return (
      <div>

        <h2>BeagleBone Black</h2>


        <p>To make testing easy, we provide demo images you can test Mender with for the BeagleBone Black.</p>

        <p>The purpose of this is to make it easier for you to test Mender with a physical device. The demo images contain configuration specific for your Mender setup, so they will not work on other setups out of the box.</p>

        <p> If you would like to use a different device type, please see the other demo images or Build with Yocto Project.</p>


        <h3>Prerequisites</h3>

        <h4>A device to test with</h4>
        <p>One or more BeagleBone Black devices.</p>

        <h4>Internet connectivity</h4>
        <p>An Ethernet cable connection for your device(s) that provides DHCP and allows internet access over TLS/443.</p>


        <h3>Download the disk image</h3>

        <p>Download the correct disk image for BeagleBone Black:</p>

        <a href={link.href}>{link.name}</a>

        <p>After the image has been downloaded, unpack it:</p>

        <div className="code">{'gunzip <PATH-TO-YOUR-DISK-IMAGE>.sdimg.gz'}</div>

        <h3>Write the disk image to the SD card</h3>

        <p>Insert the SD card of your device into your workstation.</p>

        <p>Find the path to the device where your SD card is placed on your workstation.</p>
        <p> Normally this will be <span className="code">/dev/mmcblk0</span> or <span className="code">/dev/sdb</span>. If you are unsure about its location, refer to these tutorials for <a href="https://www.raspberrypi.org/documentation/installation/installing-images/linux.md">Linux</a>, <a href="https://www.raspberrypi.org/documentation/installation/installing-images/mac.md">Mac OS</a> or <a href="https://www.raspberrypi.org/documentation/installation/installing-images/windows.md">Windows</a>.</p>

        <p> When you know the correct device for the SD card, set it and your disk image in shell variables and write it with the following commands:</p>

        <div className="code">
          <p>{'SD_CARD_DEVICE=<YOUR-SD-CARD-DEVICE>'}</p>
          <p>{'PATH_TO_DISK_IMAGE=<PATH-TO-YOUR-DISK-IMAGE>.sdimg'}</p>
          <p>sudo dd if=$PATH_TO_DISK_IMAGE of=$SD_CARD_DEVICE bs=1M && sudo sync</p>
        </div>

        <p>This may take a few minutes complete; wait until the command returns.</p>

        <h3>Boot the device</h3>

        <p>Connect your device to Ethernet network and insert the SD card into the device.</p>

        <p>Before powering on the BeagleBone Black, please press the <a href="https://docs.mender.io/user/pages/01.1.2/01.Getting-started/04.Deploy-to-physical-devices/beaglebone_black_sdboot.png">S2 button</a>. Keep the button pressed for about 5 seconds after connecting power. This will make the BeagleBone Black boot from the SD card instead of internal storage.</p>

        <p>Now connect the device to power so it boots up.</p>

        <p>Wait for 3-4 minutes until the device has fully booted and the Mender client has been able to connect to the Mender server.</p>
        <p>You should see your device pending in your Devices tab. Simply Authorize the pending device.</p>

        <p> If you cannot see any new device after 10 minutes, please verify that the network connection is working, and feel free to reach out for help with diagnostics.</p>

      </div>
    )
  }
});


module.exports = BeagleBoneBlack;