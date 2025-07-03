class LocalStorageService {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    // Get all items from storage
    getAll() {
        const items = localStorage.getItem(this.storageKey);
        return items ? JSON.parse(items) : [];
    }

    // Save item to storage
    save(item) {
        const items = this.getAll();
        if (!item.id) {
            item.id = Date.now().toString();
        }
        items.push(item);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
        return item;
    }

    // Update item in storage
    update(id, updatedItem) {
        const items = this.getAll();
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedItem };
            localStorage.setItem(this.storageKey, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    // Delete item from storage
    delete(id) {
        const items = this.getAll();
        const filteredItems = items.filter(item => item.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredItems));
    }

    // Get single item by id
    getById(id) {
        const items = this.getAll();
        return items.find(item => item.id === id);
    }

    // Clear all data
    clear() {
        localStorage.removeItem(this.storageKey);
    }
}

export default LocalStorageService;
