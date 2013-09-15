/*
    Colorizing command line output. Cannot use strict mode here as octal notation is not allowed
    in strict mode.
*/
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

/*
    ./bin/bisss calls this function to start the program passing the command line arguments.
    returns _mainFunc

    usage: require('../app.js')(process.argv);
*/
module.exports = (function () {
    'use strict';
    var path = require('path'),
        fs = require('fs'),
        home_folder = process.env.USERPROFILE || process.env.HOME || process.env.HOMEPATH,
        config_path = path.join(home_folder, '.bisss.conf'),
        configJSON;

    /*
        Initializes git repository. Assumes git exists.

        if init-git is set to false in config, just exit the method
    */
    var _initGit = function (rootPath) {
        if('init-git' in configJSON && configJSON['init-git'] === 'false') {
            return;
        }

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

    /*
        Initializes the sample package.json file. certain parameters are read from the configJSON.
        More parameters could be added later.
    */
    var _initPackageJSON = function (rootPath, projectName) {
        var pkg = '';
        pkg += '{\n';
        pkg += '    "name": "' + projectName + '",\n';
        pkg += '    "description": "",\n';
        pkg += '    "version: "0.0.0",\n';
        pkg += '    "private": true,\n';
        
        if(typeof configJSON.author === 'object') {
            pkg += '    "author: {\n';
            pkg += '        "name": "' + configJSON.author.name + '",\n';
            pkg += '        "url": "' + configJSON.author.url + '"\n';
            pkg += '    },\n';
        }
        else if ('name' in configJSON) {
            pkg += '    "author": "' + configJSON.name + '",\n';
        }

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

    /*
        Initializes README.md file. The project name is added as a title by default.
    */
    var _initReadme = function (rootPath, projectName) {
        var str = '# ' + projectName;

        console.log('creating... '.col('blue') + path.join(rootPath, 'README.md'));
        fs.writeFile(path.join(rootPath, 'README.md'), str, function (err) {
            if(err) {
                throw err;
            }
        });
    };

    /*
        Initializes default application entry point file.
        It by default names app.js and it is empty
    */
    var _initAppJS = function (rootPath) {
        console.log('creating... '.col('blue') + path.join(rootPath, 'app.js'));
        fs.open(path.join(rootPath, 'app.js'), 'w', function (err) {
            if(err) {
                throw err;
            }
        });
    };

    /*
        Initializes default .gitignore file. 
    */
    var _initGitIgnore = function (rootPath) {
        var str = 'node_modules/';

        console.log('creating... '.col('blue') + path.join(rootPath, '.gitignore'));
        fs.writeFile(path.join(rootPath, '.gitignore'), str, function (err) {
            if(err) {
                throw err;
            }

        });
    };

    /*
        Initiliazing empty LICENSE file
    */
    var _initLicense = function (rootPath) {
        console.log('creating... '.col('blue') + path.join(rootPath, 'LICENSE'));
        fs.open(path.join(rootPath, 'LICENSE'), 'w', function (err) {
            if(err) {
                throw err;
            }
        });
    };

    /* 
        reads the config file in the <i>configPath</i>. this is a synchronous operation as other
        tasks are likely to be dependent on it. If the config file does not exist, i.e. the first
        time the program is run, the config file is created with default settings.
    */
    var _readConfigJSON = function (configPath) {
        if(fs.existsSync(configPath)) {
            var configText = fs.readFileSync(configPath, { encoding: 'utf8'});
            return JSON.parse(configText);
        }
        else {
            var defaultConf = {
                "author": "",
                "license": "MIT"
            };

            fs.writeFile(configPath, JSON.stringify(defaultConf, null, "\t"), function (err) {
                if(err) {
                    throw err;
                }
            });

            return defaultConf;
        }
    };

    /* 
        creates the project folder. this is the first task in the project creation
        and the other tasks depend on it. therefore this is a syncronous operation.
    */
    var _initProjectFolder = function (rootPath) {
        if(fs.existsSync(rootPath)) {
            console.log('exists... '.col('red') + rootPath);
        }
        else {
            console.log('creating... '.col('blue') + rootPath);
            fs.mkdirSync(rootPath);
        }
    };

    /*
        reads arguments in dot notation such as: --config.author.name <value>
        and sets the value to author.name in the config file.
        creates the path if it does not exist
    */
    var _updateConfig = function (argv) {
        var cfgVal = argv[3],
            cfgKey = argv[2].replace(/^--config\./i, ""),
            cfgPath = cfgKey.split('.'),
            cfgRef = configJSON,
            len = cfgPath.length - 1,
            i;

        for(i = 0; i < len; ++i) {
            if(cfgPath[i] in cfgRef) {
                // this type checking is necessary for overwriting keys that are previously
                // of primitive type.
                if(typeof cfgRef[cfgPath[i]] !== 'object') {
                    cfgRef[cfgPath[i]] = {};
                }
                cfgRef = cfgRef[cfgPath[i]];
            }
            else {
                cfgRef[cfgPath[i]] = {};
                cfgRef = cfgRef[cfgPath[i]];
            }
        }

        cfgRef[cfgPath[len]] = cfgVal;

        fs.writeFile(config_path, JSON.stringify(configJSON, null, "\t"), function (err) {
            if(err) {
                throw err;
            }
        });
    };

    /* 
        creates the skeleton of a new project. Right now, the files to be created are pre-determined.
        each task is handled in a separate method.

        argv[2] is the project name to be created. 
        argv[3] is the path to the new project. dot command is accepted.
        example usage: ./bin/bisss bisss-test .. (linux)
                       node bin/bisss bisss-test .. (windows) 

        TODO: _readConfigJSON method should be handled outside of this method because _updateConfig also
        depends on it.
    */
    var _createProject = function(argv) {
       var rootPath, projectName, rootDir;

        projectName = argv[2];
        rootDir = argv[3] || '.';
        rootPath = path.join(__dirname, rootDir, projectName);

        // creating default files... files to be created could be read from a config file
        _initProjectFolder(rootPath);
        _initReadme(rootPath, projectName);
        _initPackageJSON(rootPath, projectName);
        _initAppJS(rootPath);
        _initGitIgnore(rootPath);
        _initLicense(rootPath);

        _initGit(rootPath);
    };

    /*
        Entry method. _createProject or _updateConfig is called based on the argument passed
    */
    var _mainFunc = function (argv) {
        if(argv.length < 3) {
            console.log('error: expected another argument for root path');
            return;
        }

        configJSON = _readConfigJSON(config_path);

        if(/^--config\./i.test(argv[2])) {
            _updateConfig(argv);
        }
        else {
            _createProject(argv);
        }
    };

    return _mainFunc;
}());
