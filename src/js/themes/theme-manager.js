// TODO Manager interface. To develop just swap the createTheme exports

// // #### Mender legacy ####
// // Reference of the unchanging mender theme appearence
// export { colors, chartColorPalette, createMenderTheme as createTheme } from './mender-theme.js';

// #### Mender MUI ####
// // Light should not look any different to the leacy mender-theme, only implemented entirely via MUI
// // Dev: Toggle `dark as` and `light as` exports to view themes
// // TODO: Remove colors and chartColorPalette exports.
export { colors, chartColorPalette, light as createTheme } from './Mender';

// // #### 3rd Party ####
