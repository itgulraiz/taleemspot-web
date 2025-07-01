import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content="#16a34a" />
          <link rel="icon" href="/favicon.ico" />
          
          {/* Google AdSense */}
          <meta name="google-adsense-account" content="ca-pub-xxxxxxxxxxxx" />
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1926773803487692"
            crossOrigin="anonymous"
          />
          
          {/* SEO improvements */}
          <meta property="og:site_name" content="TaleemSpot" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@taleemspot" />
          
          {/* Schema.org markup */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'EducationalOrganization',
                'name': 'Taleem Spot App',
                'description': 'Pakistan\'s #1 Education Resource Platform for Past Papers, Notes and Educational Resources',
                'url': 'https://app.taleemspot.com/',
                'logo': 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9',
                'sameAs': [
                  'https://facebook.com/taleemspot',
                  'https://twitter.com/taleemspot',
                  'https://instagram.com/taleemspot'
                ]
              })
            }}
          />
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
