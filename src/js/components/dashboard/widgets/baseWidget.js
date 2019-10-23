import React from 'react';
import Paper from '@material-ui/core/Paper';

export const styles = {
  rowStyle: {
    display: 'flex',
    flexDirection: 'row'
  },
  columnStyle: {
    display: 'flex',
    flexDirection: 'column'
  },
  rightAlign: {
    alignItems: 'flex-end'
  },
  leftAlign: {
    alignItems: 'flex-start'
  },
  contentStyle: {
    height: '100%',
    width: '100%'
  }
};

export class BaseWidget extends React.PureComponent {
  render() {
    const content = (
      <div style={Object.assign({}, styles.contentStyle, styles.columnStyle)} ref={ref => (this.props.innerRef ? this.props.innerRef(ref) : null)}>
        {this.props.showHelptips ? this.props.main.prepend : null}
        {this.props.header ? (
          <div style={Object.assign({ borderBottomStyle: 'solid' }, styles.rowStyle)} className="widgetHeader">
            {this.props.header}
          </div>
        ) : null}
        <div style={Object.assign({}, styles.columnStyle, styles.rightAlign)} className="widgetMainContent align-right">
          <div className="header">{this.props.main.header}</div>
          <div className="counter">{this.props.main.counter}</div>
        </div>
        <span className="link">{this.props.main.targetLabel}</span>
        {this.props.footer ? (
          <div className="widgetFooter" style={Object.assign({ borderTopStyle: 'solid' }, styles.rowStyle)}>
            {this.props.footer}
          </div>
        ) : null}
      </div>
    );
    if (this.props.isActive) {
      return (
        <Paper className={`widget ${this.props.className || ''}`} onClick={this.props.onClick} elevation={2}>
          {content}
        </Paper>
      );
    }
    return (
      <div className={`notActive widget ${this.props.className || ''}`} onClick={this.props.onClick}>
        {content}
      </div>
    );
  }
}
