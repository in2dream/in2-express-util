'use strict';

module.exports = function(config) {
    return function(req, res, next) {
        req.currentUrl = function() {
            return req.protocol + "://" + req.get('host') + req.originalUrl
        };
        return next();
    };
};