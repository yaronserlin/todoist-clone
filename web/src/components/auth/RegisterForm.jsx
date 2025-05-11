import { Form, Button, Card } from 'react-bootstrap';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function RegisterForm() {
    const { register, loading } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPwd] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(email, password);
        } catch (err) {
            alert(err.response?.data?.message || err.message); // בהמשך: ToastContext
        }
    };

    return (
        <Card className="mx-auto" style={{ maxWidth: 380 }}>
            <Card.Body>
                <Card.Title>Sign in</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text" required
                            value={name}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
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
                        {loading ? '...' : 'Login'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}
