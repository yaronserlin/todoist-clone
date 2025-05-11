import { useState, useEffect } from 'react';
import {
    Table, Button, Badge, Form, Spinner, Modal, Row, Col
} from 'react-bootstrap';
import api from '../../api/axios';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { TaskModal } from './TaskModal';


/* ========================================================================
 *  <TaskTable>
 *  • Lists tasks of logged‑in user
 *  • Toggle completion, edit, delete, create new
 * ======================================================================*/
export default function TaskTable() {

    const toast = useToast();
    const { currentProject, refreshProjects } = useProject();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShow] = useState(false);
    const [selected, setSel] = useState(null);  // task to edit

    const load = () => {
        if (!currentProject) return setTasks([]);
        setLoading(true);
        api.get('/tasks', { params: { projectId: currentProject._id } })
            .then(res => setTasks(res.data))
            .catch(err => toast.error(err.response?.data?.message || err.message))
            .finally(() => setLoading(false));
    };
    useEffect(load, [currentProject]);

    const toggleDone = async (task) => {
        await api.patch(`/tasks/${task._id}/toggle`);
        load();
        refreshProjects();
    };

    const deleteTask = async (task) => {
        if (!window.confirm('Delete this task?')) return;
        await api.delete(`/tasks/${task._id}`);
        load();
        refreshProjects();
    };

    const priorityColor = (p) => {
        switch (p) {
            case 'high': return 'warning';
            case 'urgent': return 'danger';
            case 'medium': return 'info';
            default: return 'secondary';
        }
    };

    if (!currentProject) return <p className="text-muted">Create or select a project…</p>;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="m-0">Tasks – {currentProject.name}</h4>
                <Button onClick={() => { setSel(null); setShow(true); }}>+ New Task</Button>
            </div>

            {loading ? <Spinner animation="border" /> : (
                <Table striped hover responsive>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            <th>Due</th>
                            <th>Priority</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(t => (
                            <tr key={t._id} className={t.isCompleted ? 'text-muted' : ''}>
                                <td width="30">
                                    <Form.Check type="checkbox" checked={t.isCompleted}
                                        onChange={() => toggleDone(t)} />
                                </td>
                                <td>{t.title}</td>
                                <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}</td>
                                <td>
                                    <Badge bg={priorityColor(t.priority)}>{t.priority}</Badge>
                                </td>
                                <td className="text-end" width="120">
                                    <Button size="sm" variant="outline-primary" className="me-2"
                                        onClick={() => { setSel(t); setShow(true); }}>
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="outline-danger"
                                        onClick={() => deleteTask(t)}>
                                        Del
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {showModal && (

                <TaskModal show={showModal} onHide={() => setShow(false)}
                    onSaved={load} task={selected} projectId={currentProject._id} />
            )}
        </>
    );
}
