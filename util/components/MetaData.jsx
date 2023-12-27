import Head from "next/head";
import image from "../img/TCB_Banner2.png";
const MetaData = ({ pageTitle }) => {
  const desc = `Welcome to 'The Comical Cabinet' – your go-to source for laughter, wit, and\ bashed
satire! Navigate the corridors of humor as\
we playfully dissect the latest news, societal quirks,\
and political escapades. Our satirical takes promise a\
joyous escape from the mundane, serving up a concoction of\
levity and insight. From hilarious headlines to side-splitting\
commentary, join us on a whimsical journey through the absurdities of Indian life.\
Because when reality gets too serious, The Comical Cabinet is here to remind you\
that a good laugh is the best remedy. Embrace the absurdity with a click!"`;

  return (
    <Head>
      <title>{pageTitle}</title>
      <script
        src="https://kit.fontawesome.com/yourcode.js"
        crossorigin="anonymous"
      ></script>
      <meta property="og:site_name" content="The Comical Cabinet" />
      <meta property="al:android:app_name" content="The Comical Cabinet" />
      <meta name="description" content={desc} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta content="The Hindu" itemprop="name" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:image" content={image.src}></meta>
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image.src} />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="preload" as="image" content="/icon.ico"></link>
      <link rel="icon" href="/icon.ico" />
    </Head>
  );
};
export default MetaData;
