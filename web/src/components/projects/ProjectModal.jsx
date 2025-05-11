import { Modal, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import api from '../../api/axios';

export default function ProjectModal({ onHide, onSaved }) {
    const [name, setName] = useState('');

    const save = async () => {
        await api.post('/projects', { name });
        onSaved();
        onHide();
    };

    return (
        <Modal show onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>New Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control value={name} onChange={e => setName(e.target.value)} />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={save}>Create</Button>
            </Modal.Footer>
        </Modal>
    );
}
