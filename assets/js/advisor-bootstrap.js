import React from 'react';
import ReactDOM from 'react-dom';
import AdvisorStandalone from './app/mads-cmv/containers/AdvisorStandalone';
import advisorApi from './app/mads-cmv/advisorApi';
import configSettings from './configSettings';

const ADVISOR_BOOTSTRAPPED = '__cadsAdvisorBootstrapped__';
const LOCATION_CHANGE_THROTTLE_MS = 100;
let _lastLocationChange = 0;

function ensureRoot() {
  let root = document.getElementById('cads-advisor-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'cads-advisor-root';
    const parent = document.body || document.documentElement || document;
    try {
      parent.appendChild(root);
    } catch (e) {
      console.error('Advisor: failed to append root to document', e);
    }
  }
  return root;
}

function shouldMountAdvisor() {
  if (typeof window === 'undefined') return false;
  let override = null;
  try {
    override = window.localStorage.getItem('cadsAdvisorEnabled');
  } catch (error) {
    // ignore localStorage errors
  }
  const enabledByLS = override === 'true';
  const enabledByConfig = !!(configSettings && configSettings.cadsAdvisorEnabled);
  return enabledByLS || enabledByConfig;
}

function getPageLabel(pathname) {
  if (!pathname) return null;
  const normalized = pathname.toLowerCase();
  if (normalized === '/' || normalized === '/index/' || normalized === '/home' || normalized === '/home/') {
    return 'Home';
  }
  if (normalized.startsWith('/analysis')) {
    return 'Analysis';
  }
  if (normalized.startsWith('/datamanagement')) {
    return 'Data Management';
  }
  if (normalized.startsWith('/prediction')) {
    return 'Prediction';
  }
  if (normalized.startsWith('/docs')) {
    return 'Documentation';
  }
  if (normalized.startsWith('/more')) {
    return 'Download & More';
  }
  return null;
}

function sendCurrentPageMessage() {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();
    if (now - _lastLocationChange < LOCATION_CHANGE_THROTTLE_MS) return;
    _lastLocationChange = now;
    const path = window.location.pathname || '/';
    const pageLabel = getPageLabel(path);
    if (!pageLabel || pageLabel === 'Home') return;
    // send asynchronously so this handler cannot block navigation or other sync logic
    setTimeout(() => {
      try {
        advisorApi.sendMessage({
          title: 'Current Page',
          body: `You are now at ${pageLabel}.`,
        });
      } catch (e) {}
    }, 0);
  } catch (e) {}
}

function patchHistoryNavigation() {
  if (typeof window === 'undefined' || !window.history) return;

  const wrap = (methodName) => {
    const original = window.history[methodName];
    return function (...args) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event('locationchange'));
      return result;
    };
  };

  window.history.pushState = wrap('pushState');
  window.history.replaceState = wrap('replaceState');
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });
  window.addEventListener('locationchange', sendCurrentPageMessage);
}

function mountIfNeeded() {
  if (typeof document === 'undefined' || !shouldMountAdvisor()) return;
  if (typeof window !== 'undefined' && window[ADVISOR_BOOTSTRAPPED]) {
    return;
  }

  const root = ensureRoot();
  try {
    ReactDOM.render(<AdvisorStandalone />, root);
    if (typeof window !== 'undefined') {
      window.CadsAdvisor = advisorApi;
      window[ADVISOR_BOOTSTRAPPED] = true;
      patchHistoryNavigation();
      sendCurrentPageMessage();

      // Watch for accidental removal of the advisor root
      try {
        const mo = new MutationObserver((mutations) => {
          mutations.forEach((m) => {
            if (m.type === 'childList') {
              const removed = Array.from(m.removedNodes || []).some((n) => n && n.id === 'cads-advisor-root');
            }
          });
        });
        mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
      } catch (e) {
        // ignore mutation observer errors
      }
    }
  } catch (e) {
    console.error('Advisor: failed to render', e);
  }

  // send a welcome message on the front page (quick smoke test)
  try {
    const path = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '/';
    if (path === '/' || path === '/index/' || path === '/home' || path === '/home/') {
      advisorApi.sendMessage({
        title: 'Welcome',
        body: 'Welcome to CADS — the Advisor is enabled for this session.'
      });
    }
  } catch (e) {}
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIfNeeded);
  } else {
    // DOM already ready
    mountIfNeeded();
  }
}
