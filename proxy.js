const http = require('http');
const https = require('https');
const url = require('url');

function handle(req, res) {
    if (req.method != "GET") {
        res.writeHead(400);
        res.end();
        return;
    }

    let stop = url.parse(req.url).pathname.substring(1);
    if (stop.toLowerCase() == "favicon.ico") {
        res.writeHead(404);
        res.end();
        return;
    }

    let proxyUrl = stop
        ? "https://nextbus.comfortdelgro.com.sg/eventservice.svc/Shuttleservice?busstopname=" + encodeURIComponent(decodeURIComponent(stop))
        : "https://nextbus.comfortdelgro.com.sg/eventservice.svc/BusStops";
    https.get(proxyUrl, proxyRes => {
        if (proxyRes.statusCode !== 200) {
            res.writeHead(proxyRes.statusCode);
            res.end();
            return;
        }

        res.setHeader('Access-Control-Allow-Origin', 'https://angelsl.github.io');
        if (proxyRes.headers['content-type']) {
            res.setHeader('Content-Type', proxyRes.headers['content-type']);
        }

        proxyRes.setEncoding('utf8');
        let rawData = '';
        proxyRes.on('data', (chunk) => { rawData += chunk; });
        proxyRes.on('end', () => {
            res.end(rawData, 'utf8');
        });
    });
}

let server = http.createServer(handle);
server.listen(process.env.PORT || 8080);
