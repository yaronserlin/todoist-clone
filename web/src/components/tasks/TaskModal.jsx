// ---------------------------------------------------------------------------
// TaskComponents.jsx – <TaskTable /> and <TaskModal /> with Project binding
// (FULL FILE REPLACEMENT)
// ---------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import {
    Table, Button, Badge, Form, Spinner, Modal, Row, Col
} from 'react-bootstrap';
import api from '../../api/axios';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';

/* ========================================================================
 *  <TaskModal>
 * ======================================================================*/
export function TaskModal({ show, onHide, onSaved, task, projectId }) {
    const isEdit = !!task;
    const toast = useToast();
    const { currentProject, refreshProjects } = useProject();
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDesc] = useState(task?.description || '');
    const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 10) || '');
    const [priority, setPriority] = useState(task?.priority || 'low');
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!title.trim()) return toast.error('Title required');
        setSaving(true);
        try {
            const payload = { title, description, dueDate, priority };
            if (isEdit) {
                await api.patch(`/tasks/${task._id}`, payload);
            } else {
                payload.projectId = projectId;
                await api.post('/tasks', payload);
            }
            toast.success('Saved');
            onSaved();
            refreshProjects();
            onHide();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally { setSaving(false); }
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>{isEdit ? 'Edit Task' : 'New Task'}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control value={title} onChange={e => setTitle(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3}
                            value={description} onChange={e => setDesc(e.target.value)} />
                    </Form.Group>

                    <Row className="mb-3">
                        <Col md>
                            <Form.Group>
                                <Form.Label>Due Date</Form.Label>
                                <Form.Control type="date" value={dueDate}
                                    onChange={e => setDueDate(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md>
                            <Form.Group>
                                <Form.Label>Priority</Form.Label>
                                <Form.Select value={priority} onChange={e => setPriority(e.target.value)}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" disabled={saving} onClick={save}>
                    {saving ? <Spinner size="sm" /> : 'Save'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}