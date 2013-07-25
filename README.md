# mashup
> Mashup allows you to blend two or more git repositories into one project.

Install this globally in order to access the `mashup` command anywhere on your system.

```shell
npm install -g mashup
```

##Usage

Getting started with `mashup` is pretty straight forward. There is one core command you should be aware of `mashup generate` or simply `mashup` will guide you through a series of prompts allowing you to pull multiple git repos and combine them into one project.

###Generating on the fly

Running `mashup generate` or `mashup` will present you with the following prompts:

1. Enter a git address
1. Enter a destination folder
1. Enter files to be cleaned out after cloning (follows mini-match standards), comma delimited

###Generating from a registry

A registry is beneficial when you repeatedly need to blend the same git repos. For instance, one repo can be the HTML 5 Boilerplate while the other may contain your grunt configuration. A registry is just a json file uploaded to a server which follows the format below:

'''js
{
    "template1":{
        "templates":[
            {
                "git":"https://github.com/seanpowell/Email-Boilerplate.git",
                "dest":"build",
                "clean":{
                    "files":["doc"]
                }
            }
        ]
    },
    "template2":{
        ...
}
'''

Projects can be generated off registry templates using the following command `mashup generate {registry name}:{template}`.
A registry must first be register of course.