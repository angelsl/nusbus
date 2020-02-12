addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(req) {
  if (req.method != "GET") {
    return new Response('', {status: 400});
  }

  let stop = new URL(req.url).pathname.substring(1);
  if (stop.toLowerCase() == "favicon.ico") {
    return new Response('', {status: 404});
  }

  let proxyUrl = stop
    ? `${apiurl}/ShuttleService?busstopname=` + encodeURIComponent(decodeURIComponent(stop))
    : `${apiurl}/BusStops`;
  let proxyRes = await fetch(proxyUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: auth
    }
  });

  if (proxyRes.status !== 200) {
      return new Response('', {status: proxyRes.status});
  }

  let ret = new Response(proxyRes.body);
  ret.headers.append('Access-Control-Allow-Origin', 'https://angelsl.github.io');
  if (proxyRes.headers.has('Content-Type')) {
    const resContentType = proxyRes.headers.get('Content-Type');
    const proxyContentType = resContentType.indexOf('text/html') > -1
      ? 'application/json'
      : resContentType;
    ret.headers.append('Content-Type', resContentType);
  }

  return ret;
}
