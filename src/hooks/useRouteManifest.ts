import { useEffect } from 'react';

interface RouteManifestOptions {
  manifestHref: string;
  appTitle: string;
  appleTouchIconHref?: string;
}

function upsertMeta(name: string, content: string): { el: HTMLMetaElement; created: boolean } {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  const created = !el;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return { el, created };
}

/**
 * Swaps the page's <link rel="manifest">, document title, and iOS
 * "Add to Home Screen" tags (apple-touch-icon / apple-mobile-web-app-*)
 * while the calling component is mounted, restoring the app-wide defaults
 * on unmount. Lets a single route (e.g. /solicitation) be installed as its
 * own named, iconed PWA — on Android/desktop Chrome via the swapped
 * manifest, and on iOS Safari via the swapped/created apple-* tags, since
 * iOS reads those instead of the JSON manifest — distinct from the main
 * app's identity, without a separate build or deployment.
 */
export function useRouteManifest({ manifestHref, appTitle, appleTouchIconHref }: RouteManifestOptions) {
  useEffect(() => {
    const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const originalManifestHref = manifestLink?.getAttribute('href') ?? null;
    const originalTitle = document.title;

    if (manifestLink) {
      manifestLink.setAttribute('href', manifestHref);
    }
    document.title = appTitle;

    let appleTouchLink: HTMLLinkElement | null = null;
    let originalAppleTouchHref: string | null = null;
    let createdAppleTouchLink = false;
    if (appleTouchIconHref) {
      appleTouchLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      if (appleTouchLink) {
        originalAppleTouchHref = appleTouchLink.getAttribute('href');
      } else {
        appleTouchLink = document.createElement('link');
        appleTouchLink.setAttribute('rel', 'apple-touch-icon');
        document.head.appendChild(appleTouchLink);
        createdAppleTouchLink = true;
      }
      appleTouchLink.setAttribute('href', appleTouchIconHref);
    }

    const { el: titleMeta, created: createdTitleMeta } = upsertMeta('apple-mobile-web-app-title', appTitle);
    const { el: capableMeta, created: createdCapableMeta } = upsertMeta('apple-mobile-web-app-capable', 'yes');

    return () => {
      if (manifestLink && originalManifestHref) {
        manifestLink.setAttribute('href', originalManifestHref);
      }
      document.title = originalTitle;

      if (appleTouchLink) {
        if (createdAppleTouchLink) {
          appleTouchLink.remove();
        } else if (originalAppleTouchHref) {
          appleTouchLink.setAttribute('href', originalAppleTouchHref);
        }
      }
      if (createdTitleMeta) titleMeta.remove();
      if (createdCapableMeta) capableMeta.remove();
    };
  }, [manifestHref, appTitle, appleTouchIconHref]);
}
