'use strict'

const convict = require('convict')

const schema = {
  allowedFields: {
    doc: 'An array with the names of the allowed fields. If any of the fields sent is not part of this list, the entry will be discarded and an error will be thrown.',
    docExample: 'allowedFields: ["name", "email", "message"]',
    format: Array,
    default: []
  },
  allowedOrigins: {
    doc: 'An array with the domains you might serve your website from. When enabled, the origin sent via the `options.origin` field (e.g. `<input type="hidden" name="options[origin]" value="http://yourdomain.com/post1.html">) must match one of the domains in the array, or the operation will be aborted. This is important when using notifications, as it ensures any links included in the email will point to a safe, trusted domain under your control.',
    docExample: 'allowedOrigins: ["localhost", "yourdomain.com"]',
    format: Array,
    default: []
  },
  akismet: {
    enabled: {
      doc: 'Whether to use Akismet to check entries for spam. This requires an Akismet account to be configured in the Staticman API instance being used.',
      format: Boolean,
      default: false
    },
    author: {
      doc: 'Name of the field to be used as the entry\'s author in Akistmet',
      format: String,
      default: ""
    },
    authorEmail: {
      doc: 'Name of the field to be used as the entry\'s author\'s email in Akistmet',
      format: String,
      default: ""
    },
    authorUrl: {
      doc: 'Name of the field to be used as the entry\'s author\'s URL in Akistmet',
      format: String,
      default: ""
    },
    content: {
      doc: 'Name of the field to be used as the entry\'s body in Akistmet',
      format: String,
      default: ""
    },
    type: {
      doc: 'Type of entry to be sent to Akismet',
      format: String,
      default: "comment"
    }
  },
  branch: {
    doc: 'Name of the branch being used within the GitHub repository.',
    format: String,
    default: 'master'
  },
  commitMessage: {
    doc: 'Text to be used as the commit message when pushing entries to the GitHub repository.',
    format: String,
    default: 'Add Staticman data'
  },
  filename: {
    doc: 'Name for the data files being uploaded to the repository. You can use placeholders (denoted by curly braces), which will be dynamically replaced with the content of a field (e.g. `{fields.name}`), the content of an option (e.g. `{options.slug}`) or other dynamic placeholders such as the entry\'s unique id (`{@id}`).',
    format: String,
    default: '{@id}'
  },
  format: {
    doc: 'Format of the data files being uploaded to the repository.',
    format: ['yaml', 'yml', 'json', 'frontmatter'],
    default: 'yml'
  },
  generatedFields: {
    doc: 'List of fields to be appended to entries automatically. It consists of an object where keys correspond to the names of the fields being created and values being of mixed type. If values are objects, Staticman will look for a `type` and `options` keys inside and perform different operations based on their type; otherwise, the value will be used directly as the content of the generated field.',
    docExample: 'generatedFields:\n  someField: "some string" # Simple field (string)\n  date: # Extended field (date)\n    type: date\n    options:\n      format: "timestamp-seconds"',
    format: Object,
    default: {}
  },
  moderation: {
    doc: 'When set to `true`, a pull request with the data files will be created to allow site administrators to approve or reject an entry. Otherwise, entries will be pushed to `branch` immediately.',
    format: Boolean,
    default: true
  },
  name: {
    doc: 'Human-friendly name of the property/website. This is used in notification emails.',
    docExample: 'name: "My awesome blog"',
    format: String,
    default: ""
  },
  notifications: {
    enabled: {
      doc: 'Whether email notifications are enabled. This allows users to subscribe to future comments on a thread. A [Mailgun](http://mailgun.com) account is required.',
      format: Boolean,
      default: false
    },
    apiKey: {
      doc: 'Mailgun API key',
      format: 'EncryptedString',
      default: null
    },
    domain: {
      doc: 'Mailgun domain',
      format: 'EncryptedString',
      default: null
    }
  },
  path: {
    doc: 'Path to the directory where entry files are stored. You can use placeholders (denoted by curly braces), which will be dynamically replaced with the content of a field (e.g. `{fields.name}`), the content of an option (e.g. `{options.slug}`) or other dynamic placeholders such as the entry\'s unique id (`{@id}`).',
    format: String,
    default: '_data/results/{@timestamp}'
  },
  pullRequestBody: {
    doc: 'Text to be used as the pull request body when pushing moderated entries.',
    format: String,
    default: 'Dear human,\n\nHere\'s a new entry for your approval. :tada:\n\nMerge the pull request to accept it, or close it to send it away.\n\n:heart: Your friend [Staticman](https://staticman.net) :muscle:\n\n---\n'
  },
  requiredFields: {
    doc: 'An array with the names of the fields that must be supplies as part of an entry. If any of these is not present, the entry will be discarded and an error will be thrown.',
    format: Array,
    default: []
  },
  transforms: {
    doc: 'List of transformations to be applied to any of the fields supplied. It consists of an object where keys correspond to the names of the fields being transformed. The value determines the type of transformation being applied.',
    docExample: 'transforms:\n  email: "md5" # The email field will be MD5-hashed',
    format: Object,
    default: {}
  }
}

module.exports = (data, rsa) => {
  convict.addFormat({
    name: 'EncryptedString',
    validate: val => true,
    coerce: val => {
      return rsa.decrypt(val, 'utf8')
    }
  })

  const config = convict(schema) 

  try {
    config.load(data)
    config.validate()

    return config
  } catch (e) {
    throw e
  }
}

module.exports.schema = schema
