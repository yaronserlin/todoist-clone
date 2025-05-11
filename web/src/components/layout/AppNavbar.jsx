
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from "react-router";

export default function AppNavbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate()

    return (
        <Navbar bg="dark" variant="dark" expand="md">
            <Container>
                <Navbar.Brand onClick={() => navigate('/')}> Task - Manager</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    {user && (
                        <>
                            <Nav className="me-auto">
                                <Nav.Link onClick={() => navigate('/')}>Dashboard</Nav.Link>
                            </Nav>
                            <span className="text-light me-3">Hi {user.name}</span>
                            <Button size="sm" variant="outline-light" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar >
    );
}
