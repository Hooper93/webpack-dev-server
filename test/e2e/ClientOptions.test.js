'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const startProxy = require('../helpers/start-proxy');
const [port1, port2, port3] = require('../ports-map').ClientOptions;
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

describe('Client code', () => {
  beforeAll((done) => {
    const options = {
      compress: true,
      port: port1,
      host: '0.0.0.0',
      disableHostCheck: true,
      inline: true,
      hot: true,
      watchOptions: {
        poll: true,
      },
      quiet: true,
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  // [HPM] Proxy created: /  ->  http://localhost:{port1}
  describe('behind a proxy', () => {
    let proxy;

    beforeAll((done) => {
      proxy = startProxy(port2, port1, done);
    });

    afterAll((done) => {
      proxy.close(done);
    });

    it('responds with a 200', async () => {
      {
        const req = request(`http://localhost:${port2}`);
        await req.get('/sockjs-node').expect(200, 'Welcome to SockJS!\n');
      }
      {
        const req = request(`http://localhost:${port1}`);
        await req.get('/sockjs-node').expect(200, 'Welcome to SockJS!\n');
      }
    });

    it('requests websocket through the proxy with proper port number', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/sockjs-node/))
          .then((requestObj) => {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(
                  requestObj
                    .url()
                    .includes(`http://localhost:${port1}/sockjs-node`)
                ).toBeTruthy();
                done();
              });
            });
          });
        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('Client complex inline script path', () => {
  beforeAll((done) => {
    const options = {
      port: port2,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      public: 'myhost.test',
      clientSocketOptions: {
        path: '/foo/test/bar/',
      },
      quiet: true,
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses the correct public hostname and sockPath', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) =>
            requestObj.url().match(/foo\/test\/bar/)
          )
          .then((requestObj) => {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(
                  requestObj
                    .url()
                    .includes(`http://myhost.test:${port2}/foo/test/bar/`)
                ).toBeTruthy();
                done();
              });
            });
          });
        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('Client complex inline script path with sockPort', () => {
  beforeAll((done) => {
    const options = {
      port: port2,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      clientSocketOptions: {
        path: '/foo/test/bar/',
        port: port3,
      },
      quiet: true,
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses the correct sockPort', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) =>
            requestObj.url().match(/foo\/test\/bar/)
          )
          .then((requestObj) => {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(
                  requestObj
                    .url()
                    .includes(`http://localhost:${port3}/foo/test/bar`)
                ).toBeTruthy();
                done();
              });
            });
          });

        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

// previously, using sockPort without sockPath had the ability
// to alter the sockPath (based on a bug in client-src/default/index.js)
// so we need to make sure sockPath is not altered in this case
describe('Client complex inline script path with sockPort, no sockPath', () => {
  beforeAll((done) => {
    const options = {
      port: port2,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      clientSocketOptions: {
        port: port3,
      },
      quiet: true,
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses the correct sockPort and sockPath', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/sockjs-node/))
          .then((requestObj) => {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(
                  requestObj
                    .url()
                    .includes(`http://localhost:${port3}/sockjs-node`)
                ).toBeTruthy();
                done();
              });
            });
          });
        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('Client complex inline script path with sockHost', () => {
  beforeAll((done) => {
    const options = {
      port: port2,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      clientSocketOptions: {
        host: 'myhost.test',
      },
      quiet: true,
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses the correct sockHost', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/sockjs-node/))
          .then((requestObj) => {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(
                  requestObj
                    .url()
                    .includes(`http://myhost.test:${port2}/sockjs-node`)
                ).toBeTruthy();
                done();
              });
            });
          });
        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('Client console.log', () => {
  const baseOptions = {
    port: port2,
    host: '0.0.0.0',
    quiet: true,
  };
  const cases = [
    {
      title: 'hot disabled',
      options: {
        hot: false,
      },
    },
    {
      title: 'hot enabled',
      options: {
        hot: true,
      },
    },
    {
      title: 'liveReload disabled',
      options: {
        liveReload: false,
      },
    },
    {
      title: 'liveReload enabled',
      options: {
        liveReload: true,
      },
    },
    {
      title: 'clientLogLevel is silent',
      options: {
        clientLogLevel: 'silent',
      },
    },
  ];

  for (const { title, options } of cases) {
    it(title, async () => {
      const res = [];
      const testOptions = Object.assign({}, baseOptions, options);

      // TODO: refactor(hiroppy)
      await new Promise((resolve) => {
        testServer.startAwaitingCompilation(config, testOptions, resolve);
      });

      const { page, browser } = await runBrowser();

      page.goto(`http://localhost:${port2}/main`);
      page.on('console', ({ _text }) => {
        res.push(_text);
      });

      // wait for load before closing the browser
      await page.waitForNavigation({ waitUntil: 'load' });
      await page.waitFor(beforeBrowserCloseDelay);
      await browser.close();

      expect(res).toMatchSnapshot();

      // TODO: refactor(hiroppy)
      await new Promise((resolve) => {
        testServer.close(resolve);
      });
    });
  }
});
