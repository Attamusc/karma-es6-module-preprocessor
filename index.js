// Hack around a bug in the version of Traceur used so that the polyfill doesn't happen.
var defineProperty = Object.defineProperty;
var Compiler = require('es6-module-transpiler').Compiler;

Object.defineProperty = defineProperty;

var createModuleTranspilerPreprocessor = function(args, config, logger, helper) {
  config = config || {};

  var log = logger.create('preprocessor.es6-module-transpiler');
  var defaultOptions = {
    modules: 'amd',
    compatFix: true
  };

  var options = helper.merge(defaultOptions, args.options || {}, config.options || {});

  return function(content, file, done) {
    log.debug('Processing "%s".', file.originalPath);
    var filename = file.originalPath.replace(/\.js$/, '');

    var compiler = new Compiler(content, null, options);
    var transpiledContent = compiler.toAMD();

    return done(null, transpiledContent);
  };
};

createModuleTranspilerPreprocessor.$inject = ['args', 'config.moduleTranspiler', 'logger', 'helper'];

// PUBLISH DI MODULE
module.exports = {
  'preprocessor:es6-module-transpiler': ['factory', createModuleTranspilerPreprocessor]
};
