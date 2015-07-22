const {bold} = require('chalk');

module.exports =
`  ${bold('OPTIONS')}

    ${bold('-f')},  ${bold('--force')}
        Overwrite files without prompting.

    ${bold('-i <regex>')},  ${bold('--ignore=<regex>')}
        Ignore directories matching <regex>.

    ${bold('-h')},  ${bold('--help')}
        Display this help text (--help) or short usage info (-h).
`;
