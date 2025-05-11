import TaskTable from "../components/tasks/TaskTable";
import ProjectTable from "../components/projects/ProjectTable";

export default function Dashboard() {
    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard!</p>
            <ProjectTable />
            <TaskTable />
        </div>
    )
} 