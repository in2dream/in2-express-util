'use strict';
var async = require('async');
var in2Util = require('../index');
var should = require('should');

module.exports = function() {

    var testApp;
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
                    return callback();
                });
            },
            reset: function() {
                this.middleware = [];
            },
            req: {
                session: {},
                protocol: 'http',
                originalUrl: '/test/index.html?foo=bar',
                data: {
                    host: 'test.com'
                },
                get: function(key) {
                    return this.data[key] || null;
                }
            },
            res: {
            },
        }
        done();
    });

    // req.protocol + "://" + req.get('host') + req.originalUrl
    it('::currentUrl()', function(done){
        testApp.reset();
        testApp.use(in2Util.reqUtil());
        testApp.use(function(req, res, next){
            req.currentUrl().should.be.exactly('http://test.com/test/index.html?foo=bar');
            return next();
        });
        testApp.run(done);
    });

    it('::notice()', function(done){
        testApp.reset();
        testApp.use(in2Util.reqUtil());
        testApp.use(function(req, res, next){
            (req.notice() == null).should.be.true();
            req.notice('notice some thing');
            req.session.flash.notice.should.be.exactly('notice some thing');
            var msg = req.notice();
            msg.should.be.exactly('notice some thing');
            (req.session.flash.notice == null).should.be.true();
            return next();
        });
        testApp.run(done);
    });


};