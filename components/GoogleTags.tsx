const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/** gtag.js с AW- в URL — так Google Реклама видит тег при проверке сайта */
export default function GoogleTags() {
  if (!ADS_ID && !GA_ID) return null;

  const loaderId = ADS_ID || GA_ID!;
  const configLines = [
    ADS_ID ? `gtag('config', '${ADS_ID}');` : '',
    GA_ID ? `gtag('config', '${GA_ID}');` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  const initScript = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    ${configLines}
  `;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${loaderId}`} />
      <script dangerouslySetInnerHTML={{ __html: initScript }} />
    </>
  );
}
