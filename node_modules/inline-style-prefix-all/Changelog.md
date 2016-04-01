# Changelog

## 1.0
### 1.0.3
* prevent `alignSelf` and `alignContent` from rendering alternative values
* removed some unnecessary flexbox properties from `ms` prefixes

### 1.0.2
* simplified plugins by a lot
* removed unnecessary checks and replacements
* fixed a bug that caused crashes if `display` got either `null` or `undefined` assigned ( [inline-style-prefixer#71](https://github.com/rofrischmann/inline-style-prefixer/pull/71#issue-139056802) )

### 1.0.1
* pulled a bugfix by Khan Academy that dash-cases fallback properties (https://github.com/Khan/inline-style-prefixer/commit/f41f3040ac27eeec3b7a1fb7450ddce250cac4e4)
* optimized `Webkit`-prefixed `transition` values (https://github.com/rofrischmann/inline-style-prefix-all/issues/2)

### 1.0.0
Initial version
