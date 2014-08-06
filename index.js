var defineProperty = Object.defineProperty;
var recast = require('recast');
var path = require('path');
var transpiler = require('es6-module-transpiler');
var AMDFormatter = require('es6-module-transpiler-amd-formatter');
var Container = transpiler.Container;
var FileResolver = transpiler.FileResolver;

// Monkeypatch defineProperty to have proper behavior in certain environments
Object.defineProperty = function (obj, name, config) {
    defineProperty(obj, name, config);
    return obj;
};

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

    var moduleName = file.originalPath.split(path.join(process.cwd(), '/'))[1];

    var container = new Container({
      resolvers: [new FileResolver([process.cwd()])],
      formatter: new AMDFormatter()
    });

    container.getModule(moduleName);

    var transpiledASTs = container.convert();
    var transpiledContent = recast.print(transpiledASTs[0]).code;

    return done(null, transpiledContent);
  };
};

createModuleTranspilerPreprocessor.$inject = ['args', 'config.moduleTranspiler', 'logger', 'helper'];

// PUBLISH DI MODULE
module.exports = {
  'preprocessor:es6-module-transpiler': ['factory', createModuleTranspilerPreprocessor]
};
