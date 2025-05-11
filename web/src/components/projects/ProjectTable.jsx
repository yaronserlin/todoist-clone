// ---------------------------------------------------------------------------
// ProjectTable.jsx – lists projects and allows selection + creation
// ---------------------------------------------------------------------------

import { Table, Button, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';
import api from '../../api/axios';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';

export default function ProjectTable() {
    const { projects, currentProject, setProject, refreshProjects } = useProject();
    const toast = useToast();
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');

    const createProject = async () => {
        if (!name.trim()) return toast.error('Name required');
        try {
            await api.post('/projects', { name });
            toast.success('Project created');
            setShow(false);
            setName('');
            refreshProjects();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Projects</h5>
                <Button size="sm" onClick={() => setShow(true)}>+ New</Button>
            </div>

            <Table size="sm" hover>
                <tbody>
                    {projects.map(p => (
                        <tr key={p._id}
                            className={p._id === currentProject?._id ? 'table-primary' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setProject(p)}>
                            <td>{p.name}</td>
                            <td width="40" className="text-end">{p.taskIds.length}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Create Project Modal */}
            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control value={name} placeholder="Project name"
                        onChange={e => setName(e.target.value)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    <Button variant="primary" onClick={createProject}>Save</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
