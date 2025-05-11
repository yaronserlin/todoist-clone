// מאפשר שמירת מצביע לפונקציית logout() ושימוש מכל מקום בקוד.

let logoutFn = null;

export const setLogout = (fn) => { logoutFn = fn; };

export const doLogout = () => {
    if (typeof logoutFn === 'function') logoutFn();
    else console.warn('logout function not registered');
};
