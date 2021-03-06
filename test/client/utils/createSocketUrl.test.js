'use strict';

describe('createSocketUrl', () => {
  const samples = [
    'test',
    'https://example.com',
    'https://example.com/path',
    'https://example.com/path/foo.js',
    'http://user:password@localhost/',
    'http://0.0.0.0',
    'https://localhost:123',
    'http://user:pass@[::]:8080',
    `http://0.0.0.0:9000?sockPath=${encodeURIComponent(
      '/path/to/sockjs-node'
    )}`,
    `http://0.0.0.0:9000?sockHost=${encodeURIComponent('my.host')}`,
    'http://0.0.0.0:9000?sockPort=8888',
    `http://0.0.0.0:9000?publicPath=${encodeURIComponent('/dist/')}`,
    `http://0.0.0.0:9000?sockPath=${encodeURIComponent(
      '/path/to/sockjs-node'
    )}&sockHost=${encodeURIComponent('my.host')}&sockPort=8888`,
    `http://user:pass@[::]:8080?sockPath=${encodeURIComponent(
      '/path/to/sockjs-node'
    )}&sockPort=8888`,
    `http://user:pass@[::]:8080?sockPath=${encodeURIComponent(
      '/path/to/sockjs-node'
    )}&sockHost=${encodeURIComponent('my.host')}&sockPort=8888`,
    // TODO: comment out after the major release
    // https://github.com/webpack/webpack-dev-server/pull/1954#issuecomment-498043376
    // 'file://filename',
  ];

  samples.forEach((url) => {
    jest.doMock(
      '../../../client-src/default/utils/getCurrentScriptSource.js',
      () => () => url
    );

    const {
      default: createSocketUrl,
      // eslint-disable-next-line global-require
    } = require('../../../client-src/default/utils/createSocketUrl');

    test(`should return the url when __resourceQuery is ${url}`, () => {
      // include ? at the start of the __resourceQuery to make it like a real
      // resource query
      expect(createSocketUrl(`?${url}`)).toMatchSnapshot();
    });

    test(`should return the url when the current script source is ${url}`, () => {
      expect(createSocketUrl()).toMatchSnapshot();
    });

    // put here because resetModules mustn't be reset when L27 is finished
    jest.resetModules();
  });
});
