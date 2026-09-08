import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../../../../../api/axios";
import "./FranchiseApplicationsEditor.css";

export default function FranchiseApplicationsEditor() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadApplications() {
    setLoading(true);
    api
      .get("/franchise-applications")
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Remove this application?")) return;
    await api.delete(`/franchise-applications/${id}`);
    loadApplications();
  }

  return (
    <div className="franchise-apps-editor">
      <h1 className="franchise-apps-title">Franchise Applications</h1>
      <p className="franchise-apps-sub">
        Submissions from visitors who filled out the franchise application form
      </p>

      {loading ? (
        <p className="franchise-apps-loading">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="franchise-apps-loading">No applications submitted yet.</p>
      ) : (
        <div className="franchise-apps-table-wrap">
          <table className="franchise-apps-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>State</th>
                <th>City</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>{app.name}</td>
                  <td>{app.email}</td>
                  <td>{app.state}</td>
                  <td>{app.city}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(app._id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}