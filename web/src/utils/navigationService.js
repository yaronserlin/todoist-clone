// src/utils/NavigationService.js
let navigateFn = null;

/** save the navigate() instance from useNavigate() */
export const setNavigator = (navFn) => {
    navigateFn = navFn;
};

export const navigate = (...args) => {
    if (navigateFn) navigateFn(...args);
    else console.warn('Navigator not set yet');
};