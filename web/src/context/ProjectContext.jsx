// ---------------------------------------------------------------------------
// ProjectContext.jsx – global current-project selection for Dashboard
// ---------------------------------------------------------------------------
// Provides:
//   • current project object { _id, name, ... } or null
//   • setProject(p) – switch active project
//   • projects – cached list, refreshProjects()
// ---------------------------------------------------------------------------

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const ProjectContext = createContext(null);
export default ProjectContext;

export const useProject = () => {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error('useProject must be inside <ProjectProvider>');
    return ctx;
};

export function ProjectProvider({ children }) {
    const [projects, setProjects] = useState([]);
    const [current, setCurrent] = useState(null);

    const refreshProjects = useCallback(() => {
        api.get('/projects')
            .then(res => {
                setProjects(res.data);
                // keep current selection if still exists
                if (!current && res.data.length) setCurrent(res.data[0]);
                else if (current) {
                    const found = res.data.find(p => p._id === current._id);
                    if (!found) setCurrent(res.data[0] || null);
                }
            })
            .catch(err => console.error(err));
    }, [current]);

    useEffect(refreshProjects, [current]);

    const value = {
        projects,
        currentProject: current,
        setProject: setCurrent,
        refreshProjects
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
