# mashup
> Mashup allows you to blend two or more git repositories into one project.

Install this globally in order to access the `mashup` command anywhere on your system.

```shell
npm install -g mashup
```

## Usage

Getting started with `mashup` is pretty straight forward. There is one core command you should be aware of `mashup generate` or simply `mashup` will guide you through a series of prompts allowing you to pull multiple git repos and combine them into one project.

### Generating on the fly

Running `mashup generate` or `mashup` will present you with the following prompts:

1. Enter a git url (http or ssh)
1. Enter a destination folder
1. Enter files to be cleaned out after cloning (follows mini-match standards), comma delimited
1. Would you like to clone another? *(repeat step 1)*

Once you respond 'no' you will be prompted for a remote git url to push your new project to.

### Generating from a registry

A registry is beneficial when you repeatedly need to blend the same repos or automation scenarios. For instance, one repo can be the HTML 5 Boilerplate while the other may contain your grunt configuration. A registry is just a json file uploaded to a server which follows the format below:

```js
{
    "template1":{
        "source":[
            {
                "git":"https://github.com/h5bp/html5-boilerplate.git",
                "dest":"build",
                "clean":{
                    "files":["doc"]
                }
            }
        ]
    },
    "template2":{
        "source":[
            ...
}
```

Once a registry has been added to `mashup` projects can be generated from the registry using the following command `mashup generate [registry:template]`. Power users can pass in the remote git with `mashup generate [registry:template] --remote [git]` or skip the remote git prompt entirely with `mashup generate [registry:template] --no-remote`.

#### Note
* Git urls can be either http or ssh
* If destination folder does not exist it will be created
* Repos are cloned into a temporary directory and then moved to their final destination
* Any files with the same name being moved to the same destination folder will be overridden
* In order to clone into the current working directory use a '.' as the destination

### Adding a registry

By running `mashup register` you will be guided through a series of prompts allowing you to add a new registry. Power users can bypass the prompts with `mashup register [name] [jsonURL]`

## Examples

**Generate with prompts**
```
mashup
mashup generate
mashup -g
```

**Generate from registry with remote git url prompt**
```
mashup generate registry:template1
mashup -g registry:template1
```

**Generate from registry skipping remote git url prompt**
```
mashup generate registry:template1 --no-remote
```

**Generate from registry passing in a remote git url**
```
mashup generate registry:template1 --remote https://github.com/user/new-project
```

**Add new registry with prompts**
```
mashup register
mashup -r
```

**Add new registry bypassing prompts**
```
mashup register myregistry http://mydomain/path/registry.json
mashup -r myregistry http://mydomain/path/registry.json
```

**List available registries**
```
mashup list
mashup -l
```

**List available templates within a registry**
```
mashup list myregistry
mashup -l myregistry
```
