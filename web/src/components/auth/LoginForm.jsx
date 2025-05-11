import { Form, Button, Card } from 'react-bootstrap';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useProject } from '../../context/ProjectContext';
import { useNavigate } from "react-router";

export default function LoginForm() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPwd] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const { project, refreshProjects } = useProject();
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            await login(email, password);
            refreshProjects()
            navigate('/')
            toast.success('Welcome!');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
            console.log(err.response?.data?.message || err.message);
        }
        setLoading(false)
    };

    return (
        <Card className="mx-auto" style={{ maxWidth: 380 }}>
            <Card.Body>
                <Card.Title>Sign in</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email" required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password" required
                            value={password}
                            onChange={(e) => setPwd(e.target.value)}
                        />
                    </Form.Group>
                    <Button type="submit" disabled={loading} className="w-100">
                        {loading ? 'Loading...' : 'Login'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}
