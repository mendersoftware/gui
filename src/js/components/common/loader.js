import React from 'react';

export default class Loader extends React.Component {
  render() {
    var hideClass = this.props.fade ? 'hidden' : 'loaderContainer shrunk';
    var showClass = this.props.table ? 'miniLoaderContainer' : 'loaderContainer';
    return (
      <div style={this.props.style} className={this.props.show ? showClass : hideClass}>
        <div className={this.props.waiting ? 'waiting-loader loader' : 'loader'}>
          <span className="dot dot_1" />
          <span className="dot dot_2" />
          <span className="dot dot_3" />
          <span className="dot dot_4" />
        </div>
      </div>
    );
  }
}
