const moment = jest.requireActual('moment');

Date.now = () => new Date('2019-01-01T13:00:00.000Z').getTime();

module.exports = moment;
