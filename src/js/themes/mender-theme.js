const palette = {
  primary: {
    main: '#337a87'
  },
  secondary: {
    main: '#5d0f43'
  },
  success: {
    main: '#009e73'
  },
  error: {
    main: '#ab1000'
  },
  text: {
    main: 'rgba(0, 0, 0, 0.8)'
  },
  brand: {
    mender: '#015969'
  }
};

const generatedColors = {
  a: palette.secondary.main,
  b: '#a31773',
  c: '#00859e',
  d: '#14cfda',
  e: '#9bfff0',
  f: '#d5d5d5'
};
const qualitative = {};
for (const [grp, col] of Object.entries(generatedColors)) {
  qualitative[grp] = {
    main: col
  };
}

export const colors = {
  linkgreen: '#347A87',
  /**
   * copied into use palette.brand.mender
   */
  mendergreen: palette.brand.mender,
  grey: '#c7c7c7',
  /**
   * @deprecated use theme.palette.secondary.main
   */
  mendermaroon: palette.secondary.main,
  accent2Color: '#f5f5f5',
  alertpurple: '#7D3F69',
  /**
   * @deprecated use theme.palette.text.main
   */
  textColor: palette.text.main,
  mutedText: 'rgba(0, 0, 0, 0.3)',
  tooltipText: '#DECFD9',
  alternateTextColor: 'white',
  canvasColor: 'white',
  borderColor: '#e0e0e0',
  expansionBackground: '#f7f7f7',
  disabledColor: 'rgba(0, 0, 0, 0.54)',
  /**
   * @deprecated use theme.palette.error.main
   */
  errorStyleColor: palette.error.main,
  /**
   * @deprecated use theme.palette.sucess.main
   */
  successStyleColor: '#009e73',
  red: '#8f0d0d',
  green: '#009e73'
};

export const chartColorPalette = [palette.secondary.main, '#a31773', '#00859e', '#14cfda', '#9bfff0', '#d5d5d5'];
