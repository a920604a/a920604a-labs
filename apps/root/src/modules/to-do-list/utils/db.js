// utils/db.js
import { openDB } from 'idb';

const DB_NAME = 'todo-db';
const STORE_NAME = 'todos';

const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
    },
});

export async function getAllTodos() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
}

export async function addTodo(todo) {
    const db = await dbPromise;
    await db.add(STORE_NAME, todo);
}

export async function updateTodo(todo) {
    const db = await dbPromise;
    await db.put(STORE_NAME, todo);
}

export async function deleteTodo(id) {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
}

export async function clearTodos() {
    const db = await dbPromise;
    await db.clear(STORE_NAME);
}