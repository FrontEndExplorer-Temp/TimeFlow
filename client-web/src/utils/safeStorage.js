
const memoryStorage = new Map();

const safeStorage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('Storage access denied, falling back to memory');
            return memoryStorage.get(key) || null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('Storage access denied, falling back to memory');
            memoryStorage.set(key, value);
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Storage access denied, falling back to memory');
            memoryStorage.delete(key);
        }
    }
};

export default safeStorage;
