[![Coveralls – test coverage
](https://img.shields.io/coveralls/studio-b12/less-index.svg?style=flat-square)
](https://coveralls.io/r/studio-b12/less-index)
 [![Travis – build status
](https://img.shields.io/travis/studio-b12/less-index/master.svg?style=flat-square)
](https://travis-ci.org/studio-b12/less-index)
 [![David – status of dependencies
](https://img.shields.io/david/studio-b12/less-index.svg?style=flat-square)
](https://david-dm.org/studio-b12/less-index)
 [![Stability: unstable
](https://img.shields.io/badge/stability-unstable-yellowgreen.svg?style=flat-square)
](https://github.com/studio-b12/less-index/milestones/1.0)
 [![Code style: airbnb
](https://img.shields.io/badge/code%20style-airbnb-777777.svg?style=flat-square)
](https://github.com/airbnb/javascript)




<div                                                         id="/">&nbsp;</div>

less-index
==========

**Create an entry point for a directory of LESS files.**




<p align="center"><a
  title="Graphic by the great Justin Mezzell"
  href="http://justinmezzell.tumblr.com/post/57617724502"
  >
  <br/>
  <br/>
  <img
    src="Readme/Eye.gif"
    width="400"
    height="300"
  />
  <br/>
  <br/>
</a></p>




<div                                             id="/installation">&nbsp;</div>

Installation
------------

```sh
# Globally – for a user:
npm install --global less-index

# …or locally – for a project:
npm install --save-dev less-index
```




<div                                                    id="/usage">&nbsp;</div>

Usage
-----

<!-- @doxie.inject start -->
<!-- Don’t remove or change the comment above – that can break automatic updates. -->
  SYNOPSIS

    Usage: less-index [<options>] ...<directory>
       or: less-index (-h|--help)


  DESCRIPTION

    Create an entry point for a directory of LESS files.

    Running `less-index ./module` over a directory like this:

        ./module
        ├── mixins.less
        ├── settings.less
        └── styles.less

    …will write the following content:

        @import "./module/mixins";
        @import "./module/settings";
        @import "./module/styles";

    …to the file `./module.less`.

    You can then `@import "./module";` from another LESS file and you get the
    whole lot.

    Files with an extension other than `.less` are ignored.


  OPTIONS

    -f,  --force
        Overwrite files without prompting.

    -i <regex>,  --ignore=<regex>
        Ignore directories matching <regex>.

    -h,  --help
        Display this help text (--help) or short usage info (-h).
<!-- Don’t remove or change the comment below – that can break automatic updates. More info at <http://npm.im/doxie.inject>. -->
<!-- @doxie.inject end -->




<div                                                  id="/license">&nbsp;</div>

License
-------

[MIT][] © [Studio B12 GmbH][]

[MIT]:              ./License.md
[Studio B12 GmbH]:  http://studio-b12.de
