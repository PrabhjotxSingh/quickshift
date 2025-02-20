import Topbar from "../../Parts/Topbar/Topbar";
import "./EmployerDashboard.css";

export default function EmployerDashboard() {
  const totalRevenue = 15231.89;
  const revenueChange = 20.1; //
  const teamMembers = [
    { name: "Sofia Davis", email: "m@example.com", role: "Owner" },
    { name: "Jackson Lee", email: "p@example.com", role: "Member" },
    { name: "Isabella Nguyen", email: "x@example.com", role: "Member" },
  ];

  const chartPoints = [10, 12, 8, 15, 18, 14, 20]; // random sequence

  // convert these points into an SVG path
  const width = 300;
  const height = 100;
  const maxValue = Math.max(...chartPoints);
  const minValue = Math.min(...chartPoints);
  const xStep = width / (chartPoints.length - 1);

  const pathD = chartPoints
    .map((val, idx) => {
      const x = idx * xStep;
      // invert y so that higher values go up
      const y = height - ((val - minValue) / (maxValue - minValue)) * height;
      return idx === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    })
    .join(" ");

  return (
    <>
      <Topbar />
      <div className="dashboard-container dashboard-content">
        <h2>Employer Dashboard</h2>
        <div className="stats-section">
          <div className="stat-card box-shadow-element">
            <h3>Total Revenue</h3>
            <p className="revenue-amount">${totalRevenue.toLocaleString()}</p>
            <p className="revenue-change">
              {revenueChange > 0 ? "+" : ""}
              {revenueChange}% from last month
            </p>

            <div className="chart-container">
              <svg width={width} height={height}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--primary-teal)" /* teal line */
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="team-section box-shadow-element">
          <h3>Team Members</h3>
          <ul className="team-list">
            {teamMembers.map((member) => (
              <li key={member.email}>
                <div className="member-info">
                  <span className="member-name">{member.name}</span>
                  <span className="member-email">{member.email}</span>
                </div>
                <select className="member-role" defaultValue={member.role}>
                  <option value="Owner">Owner</option>
                  <option value="Member">Member</option>
                </select>
              </li>
            ))}
          </ul>
          <button className="invite-button">Invite New Member</button>
        </div>
      </div>
    </>
  );
}
