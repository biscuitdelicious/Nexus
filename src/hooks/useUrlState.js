import { useCallback, useEffect, useState } from 'react';

const URL_CHANGE_EVENT = 'nexus:url-change';

const readParams = () => {
  const sp = new URLSearchParams(window.location.search);
  const out = {};
  for (const [k, v] of sp) out[k] = v;
  return out;
};

const writeParams = (next, { replaceHistory = false } = {}) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  if (replaceHistory) {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
  window.dispatchEvent(new CustomEvent(URL_CHANGE_EVENT));
};

export function useUrlState() {
  const [params, setParams] = useState(readParams);

  useEffect(() => {
    const refresh = () => setParams(readParams());
    window.addEventListener('popstate', refresh);
    window.addEventListener(URL_CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener('popstate', refresh);
      window.removeEventListener(URL_CHANGE_EVENT, refresh);
    };
  }, []);

  const patchParams = useCallback((patch, opts) => {
    const current = readParams();
    const next = { ...current };
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === null || v === '') delete next[k];
      else next[k] = String(v);
    }
    writeParams(next, opts);
  }, []);

  const replaceParams = useCallback((next, opts) => {
    writeParams(next || {}, opts);
  }, []);

  return [params, patchParams, replaceParams];
}
