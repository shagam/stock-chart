// memoryStore.js

const store = new Map();

const memoryStore = {
  set(key, value) {
    store.set(key, value);
  },

  get(key) {
    return store.get(key);
  },

  remove(key) {
    store.delete(key);
  },

  clear() {
    store.clear();
  }
};

export default memoryStore;