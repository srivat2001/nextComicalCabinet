// pages/_document.js

import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          />
          <meta charset="utf-8" />
          <link rel="icon" href="%PUBLIC_URL%/icon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#000000" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <meta name="description" content="Welcome to Satire" />
          <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />

          <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />

          <meta
            property="og:url"
            content="https://thecomicalcabinet.netlify.app/"
          />
          <meta property="og:site_name" content="The Comical Cabinet" />
          <meta name="twitter:card" content="%PUBLIC_URL%/TCB_Banner.png" />
          <meta name="twitter:title" content="The Comical Cabinet" />
          <meta
            name="twitter:description"
            content="the upcoming satire Portal"
          />
          <meta name="twitter:image" content="%PUBLIC_URL%/TCB_Banner.png" />

          <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js"></script>
          <title>The Comical Cabinet</title>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
