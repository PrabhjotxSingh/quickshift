import Topbar from "../../Parts/Topbar/Topbar";
import "./EmployeeDashboard.css";

export default function EmployeeDashboard() {
  // Mock data
  const totalEarnings = 3200;
  const pendingPayments = 400;

  // Chart data
  const chartPoints = [3, 4, 2.5, 3.5, 5, 4, 6]; // example earnings data
  const width = 300;
  const height = 100;
  const maxValue = Math.max(...chartPoints);
  const minValue = Math.min(...chartPoints);
  const xStep = width / (chartPoints.length - 1);

  const pathD = chartPoints
    .map((val, idx) => {
      const x = idx * xStep;
      const y = height - ((val - minValue) / (maxValue - minValue)) * height;
      return idx === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    })
    .join(" ");

  const upcomingShifts = [
    { date: "Aug 25, 2025", time: "9:00 AM - 5:00 PM", location: "Main Office" },
    { date: "Aug 26, 2025", time: "10:00 AM - 6:00 PM", location: "Warehouse" },
  ];

  return (
    <>
      <Topbar />
      <div className="employee-dashboard-container employee-dashboard-content">
        <h2>Employee Dashboard</h2>

        <div className="earnings-section">
          <div className="earnings-card box-shadow-element">
            <h3>Total Earnings</h3>
            <p className="earnings-amount">${totalEarnings.toLocaleString()}</p>
            <div className="chart-container">
              <svg width={width} height={height}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--primary-teal)"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>

          <div className="earnings-card box-shadow-element">
            <h3>Pending Payments</h3>
            <p className="earnings-amount">${pendingPayments.toLocaleString()}</p>
          </div>
        </div>

        <div className="shifts-section box-shadow-element">
          <h3>Upcoming Shifts</h3>
          <ul className="shift-list">
            {upcomingShifts.map((shift, index) => (
              <li key={index}>
                <span className="shift-date">{shift.date}</span>
                <span className="shift-time">{shift.time}</span>
                <span className="shift-location">{shift.location}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
