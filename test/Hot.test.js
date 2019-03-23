'use strict';

const helper = require('./helper');
const config = require('./fixtures/client-config/webpack.config');
const multiCompilerConfig = require('./fixtures/multi-compiler-config/webpack.config');
const runBrowser = require('./helpers/run-browser');

let readyCount = 0;
// logging could happen before page.goto is finished, so
// we need to wait for everything before closing browser
const awaitManyBeforeClose = (expectedCount, browser, done) => {
  readyCount += 1;
  if (readyCount === expectedCount) {
    readyCount = 0;
    browser.close().then(done);
  }
};

describe('Hot Module Replacement', () => {
  describe('simple hot config', () => {
    jest.setTimeout(30000);

    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        hot: true,
      };
      helper.startAwaitingCompilation(config, options, done);
    });

    afterAll(helper.close);

    beforeEach(() => {
      readyCount = 0;
    });

    it('should log that it is using HMR to the console as first message', (done) => {
      runBrowser().then(({ page, browser }) => {
        page.once('console', (msg) => {
          expect(msg.args().length).toEqual(1);
          expect(msg.text()).toMatch(/\[HMR\]/);
          awaitManyBeforeClose(2, browser, done);
        });
        page.goto('http://localhost:9000/main').then(() => {
          awaitManyBeforeClose(2, browser, done);
        });
      });
    });
  });

  describe('multi compiler hot config', () => {
    jest.setTimeout(30000);

    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        hot: true,
      };
      helper.startAwaitingCompilation(multiCompilerConfig, options, done);
    });

    afterAll(helper.close);

    it('should log that it is using HMR to the console as first message', (done) => {
      runBrowser().then(({ page, browser }) => {
        page.once('console', (msg) => {
          expect(msg.args().length).toEqual(1);
          expect(msg.text()).toMatch(/\[HMR\]/);
          awaitManyBeforeClose(2, browser, done);
        });
        page.goto('http://localhost:9000/main').then(() => {
          awaitManyBeforeClose(2, browser, done);
        });
      });
    });
  });

  describe('hot disabled', () => {
    jest.setTimeout(30000);

    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        hot: false,
      };
      helper.startAwaitingCompilation(config, options, done);
    });

    afterAll(helper.close);

    it('should not log HMR use to the console', (done) => {
      runBrowser().then(({ page, browser }) => {
        page.once('console', (msg) => {
          expect(msg.args().length).toEqual(1);
          expect(msg.text()).toMatch(/Hey\./);
          awaitManyBeforeClose(2, browser, done);
        });
        page.goto('http://localhost:9000/main').then(() => {
          awaitManyBeforeClose(2, browser, done);
        });
      });
    });
  });
});
