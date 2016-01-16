'use strict';
var async = require('async');
var in2Util = require('../index');
var should = require('should');
var util = require('util');
var testApp;
var appSession = {};

function runMiddlewareTest(middleware, config, done) {
    if (typeof(config) == 'function') {
        done = config;
        config = {};
    }
    testApp.reset();
    testApp.use(in2Util.reqUtil(config));
    if (util.isArray(middleware)) {
        middleware.forEach(function(m){
            testApp.use(m);
        });
    } else {
        testApp.use(middleware);
    }
    testApp.run(done);
}

module.exports = function() {
    before(function(done){
        testApp = {
            middleware : [],
            use: function(func) {
                this.middleware.push(func);
            },
            run: function(callback) {
                callback = callback || function(err){ if (err) throw err; };
                var self = this;
                async.eachSeries(this.middleware, function(m, done) {
                    m(self.req, self.res, done);
                }, function(err) {
                    if (err) return callback(err);
                    appSession = self.req.session;
                    return callback();
                });
            },
            reset: function() {
                this.middleware = [];
                this.req = util._extend({}, this._req);
                this.res = util._extend({}, this._res);
                this.req.session = appSession || {};
            },
            _req: {
                session: appSession,
                protocol: 'http',
                originalUrl: '/test/index.html?foo=bar',
                data: {
                    host: 'test.com'
                },
                get: function(key) {
                    return this.data[key] || null;
                }
            },
            _res: {
            },
        }
        done();
    });

    it('::currentUrl()', function(done){
        runMiddlewareTest(function(req, res, next){
            req.currentUrl().should.be.exactly('http://test.com/test/index.html?foo=bar');
            return next();
        }, done);
    });

    it('::notice()', function(done){
        appSession = {};
        var count = 0;
        runMiddlewareTest(function(req, res, next){
            if (count == 0) {
                (req.notice() === null).should.be.true();
                req.notice('notice some thing');
                req.session.flash.notice.should.be.exactly('notice some thing');
                var msg = req.notice();
                msg.should.be.exactly('notice some thing');
            }
            count++;
            return next();
        }, function(){
            testApp.run(function(){
                testApp.use(function(req, res, next){
                    (req.notice() == null).should.be.true();
                    return next();
                });
                testApp.run(done);
            });
        });
    });

    it('::notice() export notice to views', function(done){
        var count = 0;
        runMiddlewareTest(function(req, res, next){
            if (count == 0) {
                req.notice('some message');
            }
            count++;
            return next();
        }, {
            exports: {
                notice: 'myNotice'
            } 
        }, function(){
            testApp.use(function(req, res, next) {
                res.locals.myNotice.should.be.exactly('some message');
                return next();
            });
            testApp.run(done);
        });
    });
};