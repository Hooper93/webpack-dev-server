'use strict';

const webpack = require('webpack');
const updateOptions = require('../../../lib/utils/updateOptions');

describe('updateOptions', () => {
  const cases = [
    {
      title: 'no options',
      multiCompiler: false,
      options: {},
      optionsResults: null,
    },
    {
      title: 'contentBase string',
      multiCompiler: false,
      options: {
        contentBase: '/path/to/dist',
      },
      optionsResults: null,
    },
    {
      title: 'contentBase array',
      multiCompiler: false,
      options: {
        contentBase: ['/path/to/dist1', '/path/to/dist2'],
      },
      optionsResults: null,
    },
    {
      title: 'watchOptions',
      multiCompiler: false,
      options: {
        watchOptions: {
          poll: true,
        },
      },
      optionsResults: null,
    },
  ];

  cases.forEach((data) => {
    describe(data.title, () => {
      let compiler;
      beforeAll(() => {
        let webpackConfig;
        if (data.multiCompiler) {
          // eslint-disable-next-line global-require
          webpackConfig = require('../../fixtures/multi-compiler-config/webpack.config');
        } else {
          // eslint-disable-next-line global-require
          webpackConfig = require('../../fixtures/simple-config/webpack.config');
        }

        compiler = webpack(webpackConfig);
      });

      it('should set correct options', () => {
        const originalContentBase = data.options.contentBase;
        updateOptions(compiler, data.options);
        if (data.optionsResults) {
          expect(data.options).toEqual(data.optionsResults);
        } else {
          if (data.options.contentBase !== originalContentBase) {
            // we don't want this in the snapshot, because it is
            // the current working directory
            expect(data.options.contentBase).toEqual(process.cwd());
            delete data.options.contentBase;
          }
          expect(data.options).toMatchSnapshot();
        }
      });
    });
  });
});
