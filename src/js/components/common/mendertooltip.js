import { Tooltip, withStyles } from '@material-ui/core';

import theme, { colors } from '../../themes/mender-theme';

export const MenderTooltip = withStyles({
  arrow: {
    color: theme.palette.secondary.main
  },
  tooltip: {
    backgroundColor: theme.palette.secondary.main,
    boxShadow: theme.shadows[1],
    color: colors.tooltipText,
    fontSize: 'small'
  }
})(Tooltip);

export default MenderTooltip;
