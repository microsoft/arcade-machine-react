const { configure } = require('enzyme');
const ReactSixteenAdapter = require('enzyme-adapter-react-16');
configure({ adapter: new ReactSixteenAdapter() });
