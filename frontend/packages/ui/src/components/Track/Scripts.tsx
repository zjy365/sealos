export default function TrackScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-61641NFQGV';
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                page_title: document.title,
              });
            `
        }}
      />
    </>
  );
}
