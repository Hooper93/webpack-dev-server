import url from 'url';
import querystring from 'querystring';
import getCurrentScriptSource from './getCurrentScriptSource';

function getUrlParts(resourceQuery) {
  let urlParts;

  if (typeof resourceQuery === 'string' && resourceQuery !== '') {
    // If this bundle is inlined, use the resource query to get the correct url.
    urlParts = url.parse(resourceQuery.substr(1));
  } else {
    // Else, get the url from the <script> this file was called with.
    const scriptHost = getCurrentScriptSource();

    // it seems the reg exp below was intended to cut off the path of a script source,
    // so if you have my.host/long/path as the script source, it would become my.host.
    // however, it did not work, because if you had http://my.host/long/path it would
    // turn it into http:/. Cutting off the path is no longer needed, since we
    // simply do url.parse and pull the host from there.

    // eslint-disable-next-line no-useless-escape
    // scriptHost = scriptHost.replace(/\/[^\/]+$/, '');
    urlParts = url.parse(scriptHost || '/', false, true);
  }

  if (!urlParts.port || urlParts.port === '0') {
    urlParts.port = self.location.port;
  }

  const { auth, query } = urlParts;
  let { hostname, protocol } = urlParts;

  // check ipv4 and ipv6 `all hostname`
  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  const isAnyHostname =
    (hostname === '0.0.0.0' || hostname === '::') &&
    self.location.hostname &&
    // eslint-disable-next-line no-bitwise
    !!~self.location.protocol.indexOf('http');

  if (isAnyHostname) {
    hostname = self.location.hostname;
  }

  // `hostname` can be empty when the script path is relative. In that case, specifying
  // a protocol would result in an invalid URL.
  // When https is used in the app, secure websockets are always necessary
  // because the browser doesn't accept non-secure websockets.
  if (
    hostname &&
    (self.location.protocol === 'https:' || urlParts.hostname === '0.0.0.0')
  ) {
    protocol = self.location.protocol;
  }

  // default values of the sock url if they are not provided
  const defaultHost = hostname;
  const defaultSockPath = '/sockjs-node';
  const defaultPort = urlParts.port;
  const defaultPublicPath = '/';

  let sockHost = defaultHost;
  let sockPath = defaultSockPath;
  let sockPort = defaultPort;
  let publicPath = defaultPublicPath;

  // eslint-disable-next-line no-undefined
  if (query !== null && query !== undefined) {
    const parsedQuery = querystring.parse(query);
    // all of these sock url params are optionally passed in through
    // resourceQuery, so we need to fall back to the default if
    // they are not provided
    sockHost = parsedQuery.sockHost || sockHost;
    sockPath = parsedQuery.sockPath || sockPath;
    sockPort = parsedQuery.sockPort || sockPort;
    publicPath = parsedQuery.publicPath || publicPath;
  }

  return {
    protocol,
    auth,
    defaultHost,
    defaultPort,
    sockHost,
    sockPath,
    sockPort,
    publicPath,
  };
}

export default getUrlParts;
