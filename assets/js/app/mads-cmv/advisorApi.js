/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: Runtime API for communicating with the CADS Advisor.
// ------------------------------------------------------------------------------------------------
// Notes: Provides a safe message gateway and enablement handling.
// ------------------------------------------------------------------------------------------------
// References: Advisor actions, configSettings
=================================================================================================*/

import generalSettings from '../../configSettings';
import {
  addAdvisorMessage,
  setAdvisorEnabled,
  clearAdvisorMessages,
  setAdvisorMinimized,
} from './actions/advisor';

const STORAGE_KEY = 'cadsAdvisorEnabled';
const GLOBAL_ADVISOR_API_KEY = '__cadsAdvisorApi__';

const createAdvisorApi = () => ({
  store: null,
  _messages: [],
  _listeners: [],
  _isMinimized: false,
  _storeUnsubscribe: null,

  configureStore(store) {
    this.store = store;
    const enabled = this.isEnabled();
    if (store && typeof store.dispatch === 'function') {
      store.dispatch(setAdvisorEnabled(enabled));
      // If we have queued messages from no-store mode, flush them into the store
      if (this._messages && this._messages.length > 0) {
        this._messages.forEach((m) => store.dispatch(addAdvisorMessage(m)));
        this._messages = [];
      }
      this._notifyListeners();
      if (typeof store.subscribe === 'function') {
        if (typeof this._storeUnsubscribe === 'function') {
          this._storeUnsubscribe();
        }
        this._storeUnsubscribe = store.subscribe(() => this._notifyListeners());
      }
    }
    if (typeof window !== 'undefined') {
      window.CadsAdvisor = this;
    }
  },

  isEnabled() {
    if (typeof window === 'undefined') {
      return generalSettings.cadsAdvisorEnabled === true;
    }

    try {
      const override = window.localStorage.getItem(STORAGE_KEY);
      if (override === 'true') {
        return true;
      }
      if (override === 'false') {
        return false;
      }
    } catch (error) {
      // ignore localStorage errors
    }

    return generalSettings.cadsAdvisorEnabled === true;
  },

  enableTemporary() {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
      if (this.store) {
        this.store.dispatch(setAdvisorEnabled(true));
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  disableTemporary() {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, 'false');
      if (this.store) {
        this.store.dispatch(setAdvisorEnabled(false));
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  sendMessage(message) {
    if (!this.isEnabled()) {
      return false;
    }

    if (!message || typeof message !== 'object') {
      return false;
    }

    const payload = {
      id: message.id || `${Date.now()}-${Math.floor(Math.random()*1000)}`,
      title: message.title || 'Advisor',
      body: message.body || '',
      imageUrl: message.imageUrl || null,
      link: message.link || null,
      actions: Array.isArray(message.actions) ? message.actions : [],
      type: message.type || 'info',
      createdAt: message.createdAt || new Date().toISOString(),
    };

    if (this.store && typeof this.store.dispatch === 'function') {
      this.store.dispatch(addAdvisorMessage(payload));
      this._notifyListeners();
    } else {
      // queue locally and notify listeners
      this._messages.push(payload);
      this._notifyListeners();
    }

    return true;
  },

  clearMessages() {
    if (this.store && typeof this.store.dispatch === 'function') {
      this.store.dispatch(clearAdvisorMessages());
      this._notifyListeners();
      return true;
    }

    // clear local queue and notify listeners
    this._messages = [];
    this._notifyListeners();
    return true;
  },

  setMinimized(isMinimized) {
    if (this.store && typeof this.store.dispatch === 'function') {
      this.store.dispatch(setAdvisorMinimized(Boolean(isMinimized)));
      this._notifyListeners();
      return true;
    }

    this._isMinimized = Boolean(isMinimized);
    this._notifyListeners();
    return true;
  },

  // Listener API for no-store mode (and for any consumer)
  onUpdate(cb) {
    if (typeof cb !== 'function') return () => {};
    this._listeners.push(cb);
    // initial call with current state
    try {
      cb({
        enabled: this.isEnabled(),
        messages: this.store && this.store.getState ? (this.store.getState().advisor || {}).messages || [] : this._messages.slice(),
        isMinimized: this.store && this.store.getState ? (this.store.getState().advisor || {}).isMinimized || false : this._isMinimized,
      });
    } catch (e) {}
    return () => {
      this._listeners = this._listeners.filter((f) => f !== cb);
    };
  },

  _notifyListeners() {
    const state = {
      enabled: this.isEnabled(),
      messages: this.store && this.store.getState ? (this.store.getState().advisor || {}).messages || [] : this._messages.slice(),
      isMinimized: this.store && this.store.getState ? (this.store.getState().advisor || {}).isMinimized || false : this._isMinimized,
    };
    this._listeners.forEach((cb) => {
      try { cb(state); } catch (e) {}
    });
  },
});

const advisorApi = (typeof window !== 'undefined' && window[GLOBAL_ADVISOR_API_KEY])
  ? window[GLOBAL_ADVISOR_API_KEY]
  : createAdvisorApi();

if (typeof window !== 'undefined') {
  window[GLOBAL_ADVISOR_API_KEY] = advisorApi;
}

export default advisorApi;
