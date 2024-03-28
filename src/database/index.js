const { Sequelize } = require("sequelize");
const config = require('../config/config.js')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  port: config.port,
  host: config.host,
  dialect: config.dialect,
  // dialectOptions: {
  //   ssl: {
  //     require: true,
  //   }
  // }
});

module.exports = sequelize;