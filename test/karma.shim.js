require('./test-setup');

const testsContext = require.context('../src', true, /\.test\.tsx?$/)
testsContext.keys().forEach(testsContext)
