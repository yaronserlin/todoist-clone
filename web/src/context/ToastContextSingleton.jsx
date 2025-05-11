// ToastContextSingleton.js
import { toast as _ } from './ToastContext';   // after first mount sets window.__toast
export const toast = {
    info: (m) => window.__toast?.info(m),
    success: (m) => window.__toast?.success(m),
    error: (m) => window.__toast?.error(m)
};