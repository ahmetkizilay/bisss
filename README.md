# BISSS (beta)

### Installation
```sh
npm install bisss -g
```
### Usage
+ initialize default project: pass project name and project path as arguments
```sh
bisss <project-name> <project-path>
bisss bisss-test ..
```
+ set/update config: type the JSON path of the config parameter in dot notation. The path is created if it does not already exists.
```sh
bisss --config.author.name 'your name here'
bisss --config.auhor.url 'your address here'
bisss --config.init-git true
```

+ check version: if you are into that kind of thing
```sh
bisss --version
```

### what is bisss?

+ a simple utility to initialize new NodeJS projects. 
+ the sound an old turkish woman would make as she gets on the bus.
+ short for [this](http://en.wikipedia.org/wiki/Basmala).

### what does bisss do?

well, not much... so far, it creates the following files, writes some basic texts into them. Then, initializes a git repository. 
```sh
README.md
package.json
app.js
LICENSE
.gitignore
``` 