'use strict';

const { join } = require('path');
const ValidationError = require('schema-utils/src/ValidationError');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');
const Server = require('../lib/Server');
const options = require('../lib/options.json');
const SockJSServer = require('../lib/servers/SockJSServer');
const config = require('./fixtures/simple-config/webpack.config');

describe('options', () => {
  jest.setTimeout(20000);

  let consoleMock;

  beforeAll(() => {
    consoleMock = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterAll(() => {
    consoleMock.mockRestore();
  });

  it('should match properties and errorMessage', () => {
    const properties = Object.keys(options.properties);
    const messages = Object.keys(options.errorMessage.properties);

    expect(properties).toEqual(messages);

    const res = properties.every((name) => messages.includes(name));

    expect(res).toEqual(true);
  });

  {
    const memfs = createFsFromVolume(new Volume());
    // We need to patch memfs
    // https://github.com/webpack/webpack-dev-middleware#fs
    memfs.join = join;

    const cases = {
      after: {
        success: [() => {}],
        failure: [false],
      },
      before: {
        success: [() => {}],
        failure: [false],
      },
      allowedHosts: {
        success: [[], ['']],
        failure: [[false], false],
      },
      bonjour: {
        success: [false],
        failure: [''],
      },
      ca: {
        success: ['', Buffer.from('')],
        failure: [false],
      },
      cert: {
        success: ['', Buffer.from('')],
        failure: [false],
      },
      clientLogLevel: {
        success: ['silent', 'info', 'error', 'warn', 'trace', 'debug'],
        failure: ['whoops!', 'none', 'warning'],
      },
      compress: {
        success: [true],
        failure: [''],
      },
      contentBase: {
        success: [0, '.', false],
        failure: [[1], [false]],
      },
      disableHostCheck: {
        success: [true],
        failure: [''],
      },
      features: {
        success: [['before'], []],
        failure: [false],
      },
      filename: {
        success: ['', new RegExp(''), () => {}],
        failure: [false],
      },
      fs: {
        success: [
          {
            fs: memfs,
          },
        ],
        failure: [false],
      },
      headers: {
        success: [{}],
        failure: [false],
      },
      historyApiFallback: {
        success: [{}, true],
        failure: [''],
      },
      host: {
        success: ['', null],
        failure: [false],
      },
      hot: {
        success: [true],
        failure: [''],
      },
      hotOnly: {
        success: [true],
        failure: [''],
      },
      http2: {
        success: [true],
        failure: [''],
      },
      https: {
        success: [true, {}],
        failure: [''],
      },
      index: {
        success: [''],
        failure: [false],
      },
      injectClient: {
        success: [true, () => {}],
        failure: [''],
      },
      injectHot: {
        success: [true, () => {}],
        failure: [''],
      },
      inline: {
        success: [true],
        failure: [''],
      },
      key: {
        success: ['', Buffer.from('')],
        failure: [false],
      },
      lazy: {
        success: [
          {
            lazy: true,
            filename: '.',
          },
        ],
        failure: [
          {
            lazy: '',
            filename: '.',
          },
        ],
      },
      log: {
        success: [() => {}],
        failure: [''],
      },
      logLevel: {
        success: ['silent', 'info', 'error', 'warn', 'trace', 'debug'],
        failure: [false],
      },
      logTime: {
        success: [true],
        failure: [''],
      },
      mimeTypes: {
        success: [{}],
        failure: [false],
      },
      noInfo: {
        success: [true],
        failure: [''],
      },
      onListening: {
        success: [() => {}],
        failure: [''],
      },
      open: {
        success: [true, ''],
        failure: [{}],
      },
      openPage: {
        success: [''],
        failure: [false],
      },
      overlay: {
        success: [
          true,
          {},
          {
            overlay: {
              errors: true,
            },
          },
          {
            overlay: {
              warnings: true,
            },
          },
          {
            overlay: {
              arbitrary: '',
            },
          },
        ],
        failure: [
          '',
          {
            overlay: {
              errors: '',
            },
          },
          {
            overlay: {
              warnings: '',
            },
          },
        ],
      },
      pfx: {
        success: ['', Buffer.from('')],
        failure: [false],
      },
      pfxPassphrase: {
        success: [''],
        failure: [false],
      },
      port: {
        success: ['', 0, null],
        failure: [false],
      },
      profile: {
        success: [false],
        failure: [''],
      },
      progress: {
        success: [false],
        failure: [''],
      },
      proxy: {
        success: [
          {
            proxy: {
              '/api': 'http://localhost:3000',
            },
          },
        ],
        failure: [[], () => {}, false],
      },
      public: {
        success: [''],
        failure: [false],
      },
      publicPath: {
        success: [''],
        failure: [false],
      },
      quiet: {
        success: [true],
        failure: [''],
      },
      reporter: {
        success: [() => {}],
        failure: [''],
      },
      requestCert: {
        success: [true],
        failure: [''],
      },
      serveIndex: {
        success: [true],
        failure: [''],
      },
      serverSideRender: {
        success: [true],
        failure: [''],
      },
      setup: {
        success: [() => {}],
        failure: [''],
      },
      socket: {
        success: [''],
        failure: [false],
      },
      clientSocketOptions: {
        success: [{}],
        failure: [false],
      },
      staticOptions: {
        success: [{}],
        failure: [false],
      },
      stats: {
        success: [
          true,
          {},
          'none',
          'errors-only',
          'errors-warnings',
          'minimal',
          'normal',
          'verbose',
        ],
        failure: ['whoops!', null],
      },
      transportMode: {
        success: [
          'ws',
          'sockjs',
          {
            transportMode: {
              server: 'sockjs',
            },
          },
          {
            transportMode: {
              server: require.resolve('../lib/servers/SockJSServer'),
            },
          },
          {
            transportMode: {
              server: SockJSServer,
            },
          },
          {
            transportMode: {
              client: 'sockjs',
            },
          },
          {
            transportMode: {
              client: require.resolve('../client/clients/SockJSClient'),
            },
          },
          {
            transportMode: {
              server: SockJSServer,
              client: require.resolve('../client/clients/SockJSClient'),
            },
          },
        ],
        failure: [
          'nonexistent-implementation',
          null,
          {
            transportMode: {
              notAnOption: true,
            },
          },
          {
            transportMode: {
              server: false,
            },
          },
          {
            transportMode: {
              client: () => {},
            },
          },
        ],
      },
      stdin: {
        success: [false],
        failure: [''],
      },
      useLocalIp: {
        success: [false],
        failure: [''],
      },
      warn: {
        success: [() => {}],
        failure: [''],
      },
      watchContentBase: {
        success: [true],
        failure: [''],
      },
      watchOptions: {
        success: [{}],
        failure: [''],
      },
      writeToDisk: {
        success: [true, () => {}],
        failure: [''],
      },
    };

    for (const [key, values] of Object.entries(cases)) {
      it(`should validate "${key}" option`, async () => {
        const compiler = webpack(config);
        const { success, failure } = values;

        for (const sample of success) {
          let server;

          try {
            server = new Server(compiler, createOptions(key, sample));
            expect(true).toBeTruthy();
          } catch (e) {
            expect(false).toBeTruthy();
          }

          // eslint-disable-next-line no-await-in-loop
          await closeServer(server);
        }

        for (const sample of failure) {
          let server;

          try {
            server = new Server(compiler, createOptions(key, sample));
            expect(false).toBeTruthy();
          } catch (e) {
            expect(e).toBeInstanceOf(ValidationError);
          }

          // eslint-disable-next-line no-await-in-loop
          await closeServer(server);
        }
      });
    }
  }

  function createOptions(key, value) {
    return Object.prototype.toString.call(value) === '[object Object]' &&
      Object.keys(value).length !== 0
      ? value
      : {
          [key]: value,
        };
  }

  async function closeServer(server) {
    await new Promise((resolve) => {
      if (server) {
        server.close(resolve);
      } else {
        resolve();
      }
    });
  }
});
