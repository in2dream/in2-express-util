'use strict';

function initflashNotice(store, req, res) {
    req.notice = function(data) {
        if (data) {
            store.notice = data;
            return res
        }
        if (req._flashTemp) return req._flashTemp;
        if (! store.notice) return null
        req._flashTemp = store.notice;
        store.notice = null;
        return req._flashTemp;
    };
}

module.exports = function(config) {
    return function(req, res, next) {
        req.currentUrl = function() {
            return req.protocol + "://" + req.get('host') + req.originalUrl
        };

        if (req.session) {
            req.session.flash = req.session.flash || {};
            initflashNotice(req.session.flash, req, res);
        }

        return next();
    };
};