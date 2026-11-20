const store = new Map();
module.exports = {
  ACCESSIBLE: { AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AfterFirstUnlockThisDeviceOnly' },
  getGenericPassword: async ({ service }) => (store.has(service) ? { username: 'k', password: store.get(service) } : false),
  setGenericPassword: async (_u, p, { service }) => { store.set(service, p); return true; },
  resetGenericPassword: async ({ service }) => store.delete(service),
};
