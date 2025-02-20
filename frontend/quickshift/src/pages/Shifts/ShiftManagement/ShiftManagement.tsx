import { useState } from "react";
import Topbar from "../../Parts/Topbar/Topbar";
import "./ShiftManagement.css";

interface Shift {
  id: number;
  date: string;
  time: string;
  location: string;
  payRate: number;
}

export default function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>([
    { id: 1, date: "Aug 28, 2025", time: "9 AM - 5 PM", location: "Main Office", payRate: 15 },
  ]);
  const [newShift, setNewShift] = useState<Partial<Shift>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewShift({ ...newShift, [e.target.name]: e.target.value });
  };

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShift.date && newShift.time && newShift.location && newShift.payRate) {
      setShifts((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          date: newShift.date,
          time: newShift.time,
          location: newShift.location,
          payRate: parseFloat((newShift.payRate ?? 0).toString()),
        } as Shift,
      ]);
      setNewShift({});
    }
  };

  return (
    <>
      <Topbar />
      <div className="shift-management-container">
        <div className="shift-management-content">
          <h2>Shift Management</h2>
          <div className="shifts-list">
            <h3>Current Shifts</h3>
            <ul>
              {shifts.map((shift) => (
                <li key={shift.id}>
                  <span>{shift.date}</span> | <span>{shift.time}</span> |{" "}
                  <span>{shift.location}</span> | <span>${shift.payRate}/hr</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="add-shift-form">
            <h3>Add a New Shift</h3>
            <form onSubmit={handleAddShift}>
              <input
                type="text"
                name="date"
                placeholder="Date (e.g., Aug 30, 2025)"
                value={newShift.date || ""}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="time"
                placeholder="Time (e.g., 9 AM - 5 PM)"
                value={newShift.time || ""}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={newShift.location || ""}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="payRate"
                placeholder="Pay Rate (e.g., 15)"
                value={newShift.payRate || ""}
                onChange={handleInputChange}
                required
              />
              <button type="submit">Add Shift</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
