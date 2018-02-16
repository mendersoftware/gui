import React from 'react';
import PropTypes from 'prop-types';

var createReactClass = require('create-react-class');


var BeagleBoneBlack =  createReactClass({
 
  render: function() {
    var version;
    var link = {};
    if (!this.props.isEmpty(this.props.links)) {

     var versions = Object.keys(this.props.links.links.beaglebone);
     if (versions.length >1) {
      version = this.props.getLatest(versions);
     } else {
      version = versions[0];
     }


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

        <p>The purpose of this is to make it easier for you to test Mender with a physical device.</p>

        <p>If you would like to use a different device type, please see the page on <a onClick={this.props.changePage.bind(null, "help/connecting-devices/provision-a-demo/raspberry-pi-3")}>Raspberry Pi 3</a> or <a onClick={this.props.changePage.bind(null, "help/connecting-devices/build-with-yocto")}>Build with Yocto Project</a>.</p>

        <h3>Prerequisites</h3>

        <h4>A device to test with</h4>
        <p>One or more BeagleBone Black devices.</p>

        <h4>Ability to connect to Hosted Mender over the Internet</h4>
        <p>An Ethernet cable connection for your device(s) that provides DHCP and allows Internet access over TLS/443.</p>
        <p>Specifically, your device needs to be able to create outgoing TCP connections to hosted.mender.io and s3.amazonaws.com, both on port 443 (TLS).</p>
        <p>As the Mender client does not listen to any ports there are no incoming connections.</p>

        <h3>Download the disk image</h3>

        {!this.props.isEmpty(link) ? 
          <p><a href={link.href}>Download the disk image for BeagleBone Black here</a>.</p>
          <p>This demo disk image already contains configuration specific to Hosted Mender and your account (i.e. your tenant token), so it does not need any further configuration. Devices flashed with this disk image will connect to your Hosted Mender account when the devices boot.</p>
          :
          <p>Download the disk image for BeagleBone Black from <a href="https://docs.mender.io/development/getting-started/download-test-images" target="_blank">the downloads page</a>.</p>
        }

        <p>After the image has been downloaded, unpack it:</p>

        <div className="code">{'gunzip <PATH-TO-YOUR-DISK-IMAGE>.sdimg.gz'}</div>

        <h3>Write the disk image to the SD card</h3>

        <p>Insert the SD card of your device into your workstation.</p>

        <p>Find the path to the device where your SD card is placed on your workstation.</p>
        <p> Normally this will be <span className="code">/dev/mmcblk0</span> or <span className="code">/dev/sdb</span>. If you are unsure about its location, refer to these tutorials for <a href="https://www.raspberrypi.org/documentation/installation/installing-images/linux.md" target="_blank">Linux</a>, <a href="https://www.raspberrypi.org/documentation/installation/installing-images/mac.md" target="_blank">Mac OS</a> or <a href="https://www.raspberrypi.org/documentation/installation/installing-images/windows.md" target="_blank">Windows</a>.</p>

        <p> When you know the correct device for the SD card, set it and your disk image in shell variables and write it with the following commands:</p>

        <div className="code">
          <p>{'SD_CARD_DEVICE=<YOUR-SD-CARD-DEVICE>'}</p>
          <p>{'PATH_TO_DISK_IMAGE=<PATH-TO-YOUR-DISK-IMAGE>.sdimg'}</p>
          <p>sudo dd if=$PATH_TO_DISK_IMAGE of=$SD_CARD_DEVICE bs=1M && sudo sync</p>
        </div>

        <p>This may take a few minutes complete; wait until the command returns.</p>

        <h3>Boot the device</h3>

        <p>Connect your device to Ethernet network and insert the SD card into the device.</p>

        <p>Before powering on the BeagleBone Black, please press the <a href="https://docs.mender.io/user/pages/02.1.3/01.Getting-started/05.Deploy-to-physical-devices/beaglebone_black_sdboot.png" target="_blank">S2 button</a>. Keep the button pressed for about 5 seconds after connecting power. This will make the BeagleBone Black boot from the SD card instead of internal storage.</p>

        <p>Now connect the device to power so it boots up.</p>

        <p>Wait for 3-4 minutes until the device has fully booted and the Mender client has been able to connect to the Mender server.</p>
        <p>You should see your device pending in the <a onClick={this.props.changePage.bind(null, "devices")}>Devices tab</a>. Simply Authorize the pending device.</p>

        <p> If you cannot see any new device after 10 minutes, please verify that the network connection is working, and feel free to reach out for help with diagnostics via <a onClick={this.props.changePage.bind(null, "help/more-help-resources")}>our further Help resources</a>.</p>

        <p> NOTE: If you reimage the device with the disk image or switch storage (e.g. SD cards) between the devices after they have booted once, <b>authenticating the device to the Mender server will fail</b>. This is because the Mender server tracks the identity (MAC address by default) <-> device public key (randomly generated upon first run of the Mender client) binding. If this happens, you need to *decommission* the device from the Mender server and try again. <p>


        <h3>Deploy updates</h3>

        {this.props.isHosted ? 
          <p>Download these two BeagleBone Black Artifacts customized for your Hosted Mender account: TODO LINKS: Artifact1, [Artifact2].</p>
          :
          <p>Download Artifact 1 and Artifact 2 for BeagleBone Black from <a href="https://docs.mender.io/development/getting-started/download-test-images" target="_blank">the downloads page</a>.</p>
        }

        After you have downloaded the two Artifacts, upload them to the Mender server in the <a onClick={this.props.changePage.bind(null, "artifacts")}>Artifacts tab</a>.

        Then head over to the <a onClick={this.props.changePage.bind(null, "deployments")}>Deployments tab</a> and do some remote deployments to your device!

      </div>
    )
  }
});


module.exports = BeagleBoneBlack;
