const pack = require('./package')
const base = require('../../jest.base.config')

module.exports = {
  ...base,
  displayName: pack.name,
  setupFilesAfterEnv: ['<rootDir>../../jest/setup.js'],
  moduleNameMapper: {
    ...base.moduleNameMapper,
    '\\.css$': '<rootDir>../../jest/cssTransform.js',
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
}
