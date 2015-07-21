const {bold} = require('chalk');

module.exports =
`  ${bold('DESCRIPTION')}

    Create an entry point for a directory of LESS files.

    Running \`less-index ./module\` over a directory like this:

        ./module
        ├── mixins.less
        ├── settings.less
        └── styles.less

    …will write the following content:

        @import "./module/mixins";
        @import "./module/settings";
        @import "./module/styles";

    …to the file \`./module.less\`.

    You can then \`@import "./module";\` from another LESS file and you get the
    whole lot.

    Files with an extension other than \`.less\` are ignored.
`;
