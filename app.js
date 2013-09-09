/// colorizing text for command line
String.prototype.col = function(col) {
    switch(col) {
        case 'black':
            return '\033[30m' + this + '\033[0m';
        case 'red':
            return '\033[31m' + this + '\033[0m';
        case 'green':
            return '\033[32m' + this + '\033[0m';
        case 'yellow':
            return '\033[33m' + this + '\033[0m';
        case 'blue':
            return '\033[34m' + this + '\033[0m';
        case 'magenta':
            return '\033[35m' + this + '\033[0m';
        case 'cyan':
            return '\033[36m' + this + '\033[0m';
        case 'white':
            return '\033[37m' + this + '\033[0m';
        default:
            return this;
    }
};

module.exports = (function () {
    'use strict';
    var path = require('path'),
        fs = require('fs'),
        home_folder = process.env.USERPROFILE || process.env.HOME || process.env.HOMEPATH,
        config_path = path.join(home_folder, '.bisss.conf'),
        configJSON;

    var _initGit = function (rootPath) {
        var sys = require('sys'),
            exec = require('child_process').exec;

        exec("git init " + rootPath, function (err, stdout, stderr) {
            if(err) {
                throw err;
            }
            console.log('initializing git...'.col('blue'));
            sys.puts(stdout);
            sys.puts(stderr);
        });
    };

    var _initPackageJSON = function (rootPath, projectName) {
        var pkg = '';
        pkg += '{\n';
        pkg += '    "name": "' + projectName + '",\n';
        pkg += '    "description": "",\n';
        pkg += '    "version: "0.0.0",\n';
        pkg += '    "private": true,\n';
        pkg += '    "author": "' + configJSON.name + '",\n';
        pkg += '    "license": "' + configJSON.license + '",\n';
        pkg += '    "dependencies": {},\n';
        pkg += '    "repository": {\n';
        pkg += '        "type": "",\n';
        pkg += '        "url": ""\n';
        pkg += '    }\n';
        pkg += "}";

        console.log('creating... '.col('blue') + path.join(rootPath, 'package.json'));
        fs.writeFile(path.join(rootPath, 'package.json'), pkg, function (err) {
            if(err) {
                throw err;
            }
        });
    };

    var _initReadme = function (rootPath, projectName) {
        var str = '# ' + projectName;

        console.log('creating... '.col('blue') + path.join(rootPath, 'README.md'));
        fs.writeFile(path.join(rootPath, 'README.md'), str, function (err) {
            if(err) {
                throw err;
            }
        });
    };

    var _initAppJS = function (rootPath) {
        console.log('creating... '.col('blue') + path.join(rootPath, 'app.js'));
        fs.open(path.join(rootPath, 'app.js'), 'w', function (err) {
            if(err) {
                throw err;
            }
        });
    };

    var _initGitIgnore = function (rootPath) {
        var str = 'node_modules/';

        console.log('creating... '.col('blue') + path.join(rootPath, '.gitignore'));
        fs.writeFile(path.join(rootPath, '.gitignore'), str, function (err) {
            if(err) {
                throw err;
            }

        });
    };

    var _initLicense = function (rootPath) {
        console.log('creating... '.col('blue') + path.join(rootPath, 'LICENSE'));
        fs.open(path.join(rootPath, 'LICENSE'), 'w', function (err) {
            if(err) {
                throw err;
            }
        });
    };

    var _readConfigJSON = function (configPath) {
        if(fs.existsSync(configPath)) {
            var configText = fs.readFileSync(configPath, { encoding: 'utf8'});
            return JSON.parse(configText);
        }
        else {
            // create json
            return {
                "author": "",
                "license": "MIT"
            };
        }
    };

    var _mainFunc = function (argv) {
    
        var rootPath, projectName, rootDir;

        if(argv.length < 3) {
            console.log('error: expected another argument for root path');
            return;
        }
        
        projectName = argv[2];
        rootDir = argv[3] || '.';
        rootPath = path.join(__dirname, rootDir, projectName);

        configJSON = _readConfigJSON(config_path);

        if(fs.existsSync(rootPath)) {
            console.log('exists... '.col('red') + rootPath);
        }
        else {
            console.log('creating... '.col('blue') + rootPath);
            fs.mkdirSync(rootPath);
        }

        // creating default files... files to be created could be read from a config file
        _initReadme(rootPath, projectName);
        _initPackageJSON(rootPath, projectName);
        _initAppJS(rootPath);
        _initGitIgnore(rootPath);
        _initLicense(rootPath);

        _initGit(rootPath);
    };

    return _mainFunc;
}());
