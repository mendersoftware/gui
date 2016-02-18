var lazy = require('lazy-cache')(require);
lazy('extend-shallow', 'extend');
lazy('mixin-deep', 'merge');
lazy('async-helpers', 'AsyncHelpers');
lazy('helper-cache', 'Helpers');
module.exports = lazy;
