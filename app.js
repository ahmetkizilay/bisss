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

module.exports = function (argv) {
    'use strict';
    var path = require('path'),
        fs = require('fs'),
        rootPath, projectName;

    if(argv.length < 3) {
        console.log('error: expected another argument for root path');
        return;
    }
    
    projectName = argv[2];
    rootPath = path.join(__dirname, projectName);

    if(fs.existsSync(rootPath)) {
        console.log('exists: '.col('red') + rootPath);
    }
    else {
        fs.mkdirSync(rootPath);
        console.log('created: '.col('blue') + rootPath);
    }

    // creating default files... files to be created could be read from a config file
    fs.writeFile(path.join(rootPath, 'README.md'), '# ' + projectName, function (err) {
        if(err) {
            throw err;
        }

        console.log('created: '.col('blue') + path.join(rootPath, 'README.md'));
    });

    fs.openSync(path.join(rootPath, 'package.json'), 'w');
    console.log('created: '.col('blue') + path.join(rootPath, 'package.json'));

    fs.openSync(path.join(rootPath, 'app.js'), 'w');
    console.log('created: '.col('blue') + path.join(rootPath, 'app.js'));

    fs.openSync(path.join(rootPath, '.gitignore'), 'w');
    console.log('created: '.col('blue') + path.join(rootPath, '.gitignore'));

    fs.openSync(path.join(rootPath, 'LICENSE'), 'w');
    console.log('created: '.col('blue') + path.join(rootPath, 'LICENSE'));
};