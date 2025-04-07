import { Navbar1 } from "../Parts/Topbar/Topbar";
import "./MyJobs.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import Swal from "sweetalert2";

type Jobs = {
  id: string;
  name: string;
  company: string;
  pay: number;
  location: string;
  skills: string[];
  date: Date;
  coords?: [number, number];
};

const appliedJobs: Jobs[] = [
  {
    id: "1",
    name: "Dishwasher-Applied",
    company: "Downtown Diner",
    pay: 15,
    location: "14 E 47th St, New York, NY 10017",
    skills: ["Cleaning", "Teamwork", "Time Management"],
    date: new Date("2025-03-01"),
    coords: [40.755, -73.981],
  },
];

const wonJobs: Jobs[] = [
  {
    id: "1",
    name: "Dishwasher-Won",
    company: "Downtown Diner",
    pay: 15,
    location: "14 E 47th St, New York, NY 10017",
    skills: ["Cleaning", "Teamwork", "Time Management"],
    date: new Date("2025-03-01"),
    coords: [40.755, -73.981],
  },
];

const rejectedJobs: Jobs[] = [
  {
    id: "1",
    name: "Dishwasher-Rejected",
    company: "Downtown Diner",
    pay: 15,
    location: "14 E 47th St, New York, NY 10017",
    skills: ["Cleaning", "Teamwork", "Time Management"],
    date: new Date("2025-03-01"),
    coords: [40.755, -73.981],
  },
];

const pastJobs: Jobs[] = [
  {
    id: "1",
    name: "Dishwasher-Rejected",
    company: "Downtown Diner",
    pay: 15,
    location: "14 E 47th St, New York, NY 10017",
    skills: ["Cleaning", "Teamwork", "Time Management"],
    date: new Date("2025-03-01"),
    coords: [40.755, -73.981],
  },
];

export default function MyJobs() {
  const [hoveredJobId] = useState<string | null>(null);

  const handleCancel = () => {
    Swal.fire({
      title: "Cancel Job",
      text: "Are you sure you want to cancel this job?",
      confirmButtonText: "OK",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "swal2-black-button",
        cancelButton: "swal2-black-button",
      },
    });
  };

  const handleContact = () => {
    Swal.fire({
      title: "Contact Employer",
      text: "The employer's contact information is EMAIL",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "swal2-black-button",
      },
    });
  };

  const renderTable = (
    title: string,
    jobs: Jobs[],
    actionType?: "cancel" | "contact"
  ) => (
    <div className="table-container my-10 p-4 bg-white rounded-lg shadow">
      <center>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      </center>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Pay</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date</TableHead>
            {actionType && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              className={`cursor-pointer transition ${
                hoveredJobId === job.id ? "bg-gray-100" : ""
              }`}
            >
              <TableCell>{job.name}</TableCell>
              <TableCell>{job.company}</TableCell>
              <TableCell>${job.pay}/hr</TableCell>
              <TableCell>{job.location}</TableCell>
              <TableCell>{job.date.toDateString()}</TableCell>
              {actionType && (
                <TableCell>
                  {actionType === "cancel" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel();
                      }}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContact();
                      }}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                    >
                      Contact
                    </button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <Navbar1 />
      <div className="px-6 py-10 max-w-6xl mx-auto">
        {renderTable("Won Jobs", wonJobs, "contact")}
        {renderTable("Applied Jobs", appliedJobs, "cancel")}
        {renderTable("Rejected Jobs", rejectedJobs)}
        {renderTable("Past Jobs", pastJobs)}
      </div>
    </>
  );
}
