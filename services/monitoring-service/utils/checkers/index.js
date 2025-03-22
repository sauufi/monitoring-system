// services/monitoring-service/utils/checkers/index.js
const checkWebsite = require('./websiteChecker');
const checkSSL = require('./sslChecker');
const checkDomain = require('./domainChecker');
const checkPing = require('./pingChecker');
const checkPort = require('./portChecker');
const checkTCP = require('./tcpChecker');
const checkKeyword = require('./keywordChecker');
const checkCron = require('./cronJobChecker');

/**
 * Map of monitor types to their checker functions
 */
module.exports = {
  website: checkWebsite,
  ssl: checkSSL,
  domain: checkDomain,
  ping: checkPing,
  port: checkPort,
  tcp: checkTCP,
  keyword: checkKeyword,
  cron: checkCron
};