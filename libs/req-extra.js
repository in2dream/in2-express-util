'use strict';

function initFlash(store, req, res) {
    store = store || { __ref : 1 };
    if (Object.keys(store).length > 1) {
        store.__ref--;
        if (store.__ref < 0) store = { __ref : 1 };
    }
    req.flash = {
        set: function(key, value) {
            store[key] = value;
        },
        get: function(key, fallback) {
            return store[key] === undefined ? fallback : store[key];
        }
    };

    return store;
}

function initFlashNotice(req, res) {
    req.notice = function(data) {
        if (data) {
            return req.flash.set('notice', data);
        }
        return req.flash.get('notice', null);
    };
}

module.exports = function(config) {
    config = config || {};
    config.exports = config.exports || { notice: false };
    return function(req, res, next) {
        req.currentUrl = function() {
            return req.protocol + "://" + req.get('host') + req.originalUrl
        };

        if (req.session) {
            req.session.flash = initFlash(req.session.flash, req, res);
            initFlashNotice(req, res);

            // export notice to views
            if (config.exports.notice && req.notice()) {
                res.locals = res.locals || {};
                res.locals[config.exports.notice] = req.notice();
            }
        }

        return next();
    };
};