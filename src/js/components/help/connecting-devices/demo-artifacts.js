import React from 'react';
import PropTypes from 'prop-types';
var Loader = require('../../common/loader');

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

var createReactClass = require('create-react-class');

var DemoArtifacts =  createReactClass({

 	_changePage: function(path) {
 		this.props.changePage(path);
 	},
	render: function() {
		var links = [];
		var placeholder;

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
					 			var lastPart = tmp.split(".").pop();
					 			if (lastPart === "mender") {
					 				i++;
					 				thisRow["link"+i] = versionLinks[tmp];
					 			}
					 		}
					 		links.push(thisRow);
					 	}
		 			}
		 		}
		 	}
	    } else if (this.props.isHosted) {
	    	placeholder = (
		        <div className="waiting-inventory">
		          <p>Your images are currently being generated. Download links should appear here within 5 minutes</p>
		          <Loader show={true} waiting={true} />
		        </div>
      		)
	    }

	    var tableRows = links.map(function(link, index) {
	    	if (link.link1) {
	    		return (
    				<TableRow key={link.name+index}>
						<TableRowColumn>{link.name}</TableRowColumn>
						<TableRowColumn>{link.version}</TableRowColumn>
						<TableRowColumn><a href={link.link2}>{link.link2}</a></TableRowColumn>
						<TableRowColumn><a href={link.link1}>{link.link1}</a></TableRowColumn>
					</TableRow>
				)
	    	}
	    });

	    return (
	        <div>
	        	<h2>Download demo Artifacts</h2>

	         	<p>We provide demo Artifacts that you can use with devices connected to the Mender server (see <a onClick={this._changePage.bind(null, "help/connecting-devices/provision-a-demo")}>Provision demo device</a>).</p>
				<p>Two Artifacts are provided for each device type so that you can do several deployments (Mender will skip deployments if the Artifact installed is the same as the one being deployed).</p>

				{this.props.isHosted ? <div>

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

						</Table>
						<p>Then upload them to the <a onClick={this._changePage.bind(null, "artifacts")}>Artifacts tab</a>.</p>
						</div>
						: placeholder
						
					}
					</div> : <p>Download the Artifacts for your desired device types from <a href={"https://docs.mender.io/"+this.props.docsVersion+"/getting-started/download-test-images"} target="_blank">the downloads page.</a></p>
				}

				
	        </div>
	    )
	}
});


module.exports = DemoArtifacts;



