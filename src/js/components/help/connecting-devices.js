import React from 'react';
import PropTypes from 'prop-types';
import { Router, Link } from 'react-router';

var createReactClass = require('create-react-class');

var ConnectingDevices =  createReactClass({
	render: function() {

		var links = [];
		var list = (this.props.pages||{})['connecting-devices'];
		var toplevel = "";
		function eachRecursive(list, level) {
			for (var k in list) {

				// fix link for nested levels
				toplevel = level >0 ? toplevel : k;
				var relative_path = level >0 ? toplevel + "/" + k : k;
		 		if (typeof list[k] == "object" && list[k] !== null && k!=="component") {
		 			links.push(<p key={k} style={{paddingLeft: level*16}}><Link to={`help/connecting-devices/${relative_path}`}>{list[k].title}</Link></p>);
		 			eachRecursive(list[k], level+1);
		 		}
		 	}
		}
		eachRecursive(list, 0);
	 	
	    return (
	       <div>
	         <h2>Connecting devices</h2>
	         <p>Learn how to connect devices to the Mender server.</p>
	         <br/>
	         <p>Topic pages:</p>
	         {links}
	       </div>
	    )
	}
});

ConnectingDevices.contextTypes = {
  router: PropTypes.object,
};

module.exports = ConnectingDevices;