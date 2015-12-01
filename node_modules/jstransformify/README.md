# jstransformify

Browserify transform which applies [facebook/jstransform](https://github.com/facebook/jstransform) visitors, allowing for easily writing code with ES6 features like classes, arrow functions, destructured assignment, etc.

## Installation

    > npm install jstransformify

## Usage

    > browserify -t [ jstransformify -v jstransform/visitors/es6-class-visitors -v jstransform/visitors/es6-destructuring-visitors ] app.js > bundle.js

## Available transforms
 - es6-arrow-function-visitors
 - ​es6-class-visitors
 - ​es6-destructuring-visitors
 - ​es6-object-concise-method-visitors
 - ​es6-object-short-notation-visitors
 - ​es6-rest-param-visitors
 - ​es6-template-visitors
 - ​es7-spread-property-visitors

 _Visit [jstransform](https://github.com/facebook/jstransform/tree/master/visitors) for a complete list of available visitors_

