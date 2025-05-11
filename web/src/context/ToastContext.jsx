// ------------------------------------------------------------
// ToastContext.jsx – global toast notification provider
// ------------------------------------------------------------
// Usage:
//   <ToastProvider><App/></ToastProvider>
//   const { toast } = useContext(ToastContext);
//   toast.success('Saved!'); toast.error('Oops');
// ------------------------------------------------------------

import { createContext, useState, useCallback, useContext } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);
export default ToastContext;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    /* helper to push new toast */
    const push = useCallback((msg, variant = 'info') => {
        const id = Date.now();
        setToasts(ts => [...ts, { id, msg, variant }]);
    }, []);

    /* quick helpers */
    const api = {
        info: (m) => push(m, 'info'),
        success: (m) => push(m, 'success'),
        error: (m) => push(m, 'danger'),
        warning: (m) => push(m, 'warning')
    };

    window.__toast = api;

    const remove = (id) => setToasts(ts => ts.filter(t => t.id !== id));

    return (
        <ToastContext.Provider value={{ toast: api }}>
            {children}

            {/* Toast container fixed bottom-end */}
            <ToastContainer position="bottom-end" className="p-3">
                {toasts.map(t => (
                    <Toast key={t.id} bg={t.variant} onClose={() => remove(t.id)} delay={3000} autohide>
                        <Toast.Body className="text-white">{t.msg}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
}

/* ------------------------------------------------------------------
 * Convenience hook – import { useToast } from …
 * ----------------------------------------------------------------*/
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
    return ctx.toast;
};
