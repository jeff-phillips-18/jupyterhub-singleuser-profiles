import { TrackingEventProperties } from './types';

export const fireTrackingEvent = (
  eventType: string,
  properties?: TrackingEventProperties,
): void => {
  const clusterID = window.clusterID ?? '';
  if (window.analytics) {
    switch (eventType) {
      case 'identify':
        window.analytics.identify(properties?.anonymousID, { clusterID });
        break;
      case 'page':
        window.analytics.page(undefined, { clusterID });
        break;
      default:
        window.analytics.track(eventType, { ...properties, clusterID });
    }
  }
};

export const initSegment = (segmentKey: string, username: string): void => {
  const analytics = (window.analytics = window.analytics || []);
  if (analytics.initialize) {
    return;
  }
  if (analytics.invoked)
    window.console && console.error && console.error('Segment snippet included twice.');
  else {
    analytics.invoked = true;
    analytics.methods = [
      'trackSubmit',
      'trackClick',
      'trackLink',
      'trackForm',
      'pageview',
      'identify',
      'reset',
      'group',
      'track',
      'ready',
      'alias',
      'debug',
      'page',
      'once',
      'off',
      'on',
      'addSourceMiddleware',
      'addIntegrationMiddleware',
      'setAnonymousId',
      'addDestinationMiddleware',
    ];
    analytics.factory = function (e: string) {
      return function (...rest) {
        const t = Array.prototype.slice.call(rest);
        t.unshift(e);
        analytics.push(t);
        return analytics;
      };
    };
    for (let e = 0; e < analytics.methods.length; e++) {
      const key = analytics.methods[e];
      analytics[key] = analytics.factory(key);
    }
    analytics.load = function (key: string, e: Event) {
      const t = document.createElement('script');
      t.type = 'text/javascript';
      t.async = true;
      t.src = `https://cdn.segment.com/analytics.js/v1/${encodeURIComponent(key)}/analytics.min.js`;
      const n = document.getElementsByTagName('script')[0];
      if (n.parentNode) {
        n.parentNode.insertBefore(t, n);
      }
      analytics._loadOptions = e;
    };
    analytics.SNIPPET_VERSION = '4.13.1';
    if (segmentKey) {
      analytics.load(segmentKey);
    }
    crypto.subtle.digest('SHA-1', new TextEncoder().encode(username)).then((anonymousIDBuffer) => {
      const anonymousIDArray = Array.from(new Uint8Array(anonymousIDBuffer));
      const anonymousID = anonymousIDArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      fireTrackingEvent('identify', { anonymousID });
    });
  }
};
