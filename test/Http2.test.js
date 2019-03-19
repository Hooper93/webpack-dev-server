'use strict';

const path = require('path');
const http2 = require('http2');
const request = require('supertest');
const semver = require('semver');
const helper = require('./helper');
const config = require('./fixtures/contentbase-config/webpack.config');

const contentBasePublic = path.join(
  __dirname,
  'fixtures/contentbase-config/public'
);

describe('HTTP2', () => {
  let server;
  let req;

  describe('without https it should throw an error', () => {
    it('create server', () => {
      expect(() => {
        helper.start(config, {
          http2: true,
        });
      }).toThrow(/'https' option must be enabled/);
    });
  });

  // HTTP/2 will only work with node versions below 10.0.0
  // since spdy is broken past that point
  if (semver.lt(process.version, '10.0.0')) {
    describe('http2 works with https', () => {
      beforeAll((done) => {
        server = helper.start(
          config,
          {
            contentBase: contentBasePublic,
            https: true,
            http2: true,
          },
          done
        );
        req = request(server.app);
      });

      it('confirm http2 client can connect', (done) => {
        const client = http2.connect('https://localhost:8080', {
          rejectUnauthorized: false,
        });
        client.on('error', (err) => console.error(err));

        const http2Req = client.request({ ':path': '/' });

        http2Req.on('response', (headers) => {
          expect(headers[':status']).toEqual(200);
        });

        http2Req.setEncoding('utf8');
        let data = '';
        http2Req.on('data', (chunk) => {
          data += chunk;
        });
        http2Req.on('end', () => {
          expect(data).toEqual(expect.stringMatching(/Heyo/));
          done();
        });
        http2Req.end();
      });

      afterAll(helper.close);
    });
  }

  describe('https without http2 disables HTTP/2', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          https: true,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req
        .get('/')
        .expect(200, /Heyo/)
        .then(({ res }) => {
          expect(res.httpVersion).not.toEqual('2.0');
          done();
        });
    });

    afterAll(helper.close);
  });
});
