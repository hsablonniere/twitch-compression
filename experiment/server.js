import http from 'http';
import { chainAll } from 'hititipi/src/middlewares/chain-all.js';
import { chainUntilResponse } from 'hititipi/src/middlewares/chain-until-response.js';
import { hititipi } from 'hititipi/src/hititipi.js';
import { logRequest } from 'hititipi/src/middlewares/log-request.js';
import { redirectNormalizedPath } from 'hititipi/src/middlewares/redirect-normalized-path.js';
import { staticFile } from 'hititipi/src/middlewares/static-file.js';
import { contentEncoding } from 'hititipi/src/middlewares/content-encoding.js';
import { ResponseTransformer } from './response-transformer.js';

import { plugin } from './post-css-plugin.js';
import postcss from 'postcss';

http
  .createServer(
    hititipi(
      logRequest(
        chainAll([
          chainUntilResponse([
            redirectNormalizedPath(),
            staticFile({ root: 'public' }),
          ]),
          (context) => {
            const customCompression = context.requestHeaders['x-custom-compression'];
            if (customCompression === '1') {
              const responseTransformers = [
                ...context.responseTransformers,
                new ResponseTransformer(async (responseBuffer) => {
                  const sourceCss = responseBuffer.toString();
                  const outputCss = await postcss([plugin()]).process(sourceCss, {
                    from: 'src/app.css',
                    to: 'dest/app.css',
                  });
                  return outputCss.css;
                }),
              ];
              return { ...context, responseTransformers };
            }
          },
          (context) => {
            const p = context.requestUrl.pathname;
            if (p.endsWith('.css')) {
              const gzip = p.includes('/min-gzip');
              const brotli = p.includes('/min-brotli');
              return contentEncoding({ gzip, brotli });
            }
          },
          (context) => {
            if (context.responseStatus == null) {
              return { ...context, responseStatus: 404 };
            }
          },
        ]),
      ),
    ),
  )
  .listen(8080);
