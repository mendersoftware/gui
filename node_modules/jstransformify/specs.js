var vm              = require('vm');
var assert          = require('assert');
var browserify      = require('browserify');
var jstransformify  = require('./index');

describe('jstransformify', function() {

  it('works', function(done) {
    browserify('./fixture')
      .transform({es6: true}, jstransformify)
      .bundle(function(err, code) {
        if (err) return done(err);
        assert.ok(code);

        var value;
        var sandbox = {
          console: { log: function(v) { value = v.toString(); } }
        };

        vm.runInNewContext(code, sandbox);
        assert.equal(value, 'fixture code');

        done();
      });
  });

});
