#!/usr/bin/env node
;
var cli, cwd, discover, dry_guardian, fs, path, print_list, ref, reinstall_all, save, tap;

ref = require('.'), discover = ref.discover, reinstall_all = ref.reinstall_all, save = ref.save;

cli = require('commander');

path = require('path');

fs = require('fs');

cwd = process.cwd();

cli.version('0.0.0').description("A utility to properly install npm git dependencies.").option('-q --silent', 'suppress child processes output').option('-s --save', 'resolve URLs to sha and save it to package file').option('-c --package <path>', 'Optional package.json file location [package.json]', "package.json").option('-v --verbose', 'be verbose').option('-d --dry', 'just print what packages would be installed');


/*
tap : Function -> Identity

Executes a function on a value and returns value, ignoring whatever the function returns. Useful for debugging or performing other side effects.
 */

tap = function(fn) {
  return function(value) {
    fn(value);
    return value;
  };
};


/*
print_list : String -> Object -> [String] -> undefined

Prints formated list of strings with title. Useful for printing list of discovered packages.
 */

print_list = function(title, options) {
  if (title == null) {
    title = "List";
  }
  if (options == null) {
    options = {};
  }
  return function(list) {
    var i, item, len;
    if (!(options.dry || options.verbose)) {
      return;
    }
    console.log(title + ":");
    for (i = 0, len = list.length; i < len; i++) {
      item = list[i];
      console.log("  " + item);
    }
    return console.log('');
  };
};


/*
dry_guardian : Object -> -> undefined

Terminate the script if options.dry is truthy.
 */

dry_guardian = function(options) {
  return function() {
    if (!options.dry) {
      return;
    }
    console.log('Finished dry run.');
    console.log('');
    return process.exit(0);
  };
};

cli.command('install [packages...]').description('install git dependencies').action(function(packages, command) {
  var options;
  options = command.parent.opts();
  console.log({
    options: options,
    packages: packages
  });
  if (packages.length === 0) {
    packages = discover(options["package"]);
    (print_list("Installing packages from " + options["package"], options))(packages);
  } else {
    (print_list("Installing following packages", options))(packages);
  }
  return Promise.resolve(packages).then(tap(dry_guardian(options))).then(reinstall_all(options)).then(tap(print_list("Following packages has been installed", options))).then(function(report) {
    if (!options.save) {
      return;
    }
    if (options.verbose) {
      console.log("Updating " + options["package"]);
    }
    return save(options["package"], report);
  })["catch"](function(error) {
    console.error(error);
    return process.exit(5);
  });
});

cli.parse(process.argv);

//# sourceMappingURL=cli.js.map
