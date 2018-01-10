import React from 'react';
import PropTypes from 'prop-types';

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

var createReactClass = require('create-react-class');

var DemoArtifacts =  createReactClass({

 	_changePage: function(path) {
 		this.props.changePage(path);
 	},
	render: function() {
		var links = [];

		 if (!this.props.isEmpty(this.props.links)) {

		 	for (var k in this.props.links.links) {
		 		
		 		// go through returned json to extract links per type + version
		 		if (typeof this.props.links.links[k] == "object") {
		 			// if an object, expect it to be links for device type
		 			for (var version in this.props.links.links[k]) {
		 				var thisRow = {name: k, version: version};
		 				var versionLinks = this.props.links.links[k][version];
		 				if (typeof versionLinks == "object") {
			 				var i = 0;

					 		for (var tmp in versionLinks) {
					 			if (tmp.indexOf('mender.gz') != -1) {
					 				i++;
					 				thisRow["link"+i] = versionLinks[tmp];
					 			}
					 		}
					 		links.push(thisRow);
					 	}
		 			}
		 		}
		 	}
	    }

	    var tableRows = links.map(function(link, index) {
	    	if (link.link1) {
	    		return (
    				<TableRow key={link.name+index}>
						<TableRowColumn>{link.name}</TableRowColumn>
						<TableRowColumn>{link.version}</TableRowColumn>
						<TableRowColumn><a href="{link.link1}">{link.link1}</a></TableRowColumn>
						<TableRowColumn><a href="{link.link2}">{link.link2}</a></TableRowColumn>
					</TableRow>
				)
	    	}
	    });

	    return (
	        <div>
	        	<h2>Download demo Artifacts</h2>

	         	<p>We provide demo Artifacts that you can use with devices connected to the Mender server (see <a onClick={this._changePage.bind(null, "help/connecting-devices/provision-a-demo")}>Provision demo device</a>).</p>
				<p>Two Artifacts are provided for each device type so that you can do several deployments (Mender will skip deployments if the Artifact installed is the same as the one being deployed).</p>

				

				{ !this.props.isEmpty(this.props.links) ?
					<div>
					<p>Download the Artifacts for your desired device types below:</p>
					<Table
						selectable={false}>
					<TableHeader adjustForCheckbox={false}
						displaySelectAll={false}>
						<TableRow>
						<TableHeaderColumn>Device type</TableHeaderColumn>
						<TableHeaderColumn>Mender version</TableHeaderColumn>
						<TableHeaderColumn>Artifact 1</TableHeaderColumn>
						<TableHeaderColumn>Artifact 2</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody displayRowCheckbox={false}>
						{tableRows}
					</TableBody>

					</Table></div>
					: 
					<p>Download the Artifacts for your desired device types from <a href="https://docs.mender.io/development/getting-started/download-test-images" target="_blank">the downloads page.</a></p>
				}

				<p>Then upload them to the <a onClick={this._changePage.bind(null, "artifacts")}>Artifacts tab</a>.</p>
	        </div>
	    )
	}
});


module.exports = DemoArtifacts;



