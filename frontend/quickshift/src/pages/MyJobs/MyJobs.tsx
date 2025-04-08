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
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { BackendAPI } from "@/lib/backend/backend-api";
import { AxiosResponse } from "axios";

// Interface based on shift-applicant.model
interface ShiftApplicant {
  _id: string;
  company: string;
  shiftId: string;
  user: string;
  rejected: boolean;
  shift?: {
    _id: string;
    name: string;
    company: string;
    companyName: string;
    pay: number;
    location: {
      latitude: number;
      longitude: number;
    };
    startTime: string;
    endTime: string;
    tags: string[];
    isOpen: boolean;
    isComplete: boolean;
  };
}

// Interface for Shift data
interface Shift {
  _id: string;
  name: string;
  company: {
    _id: string;
    name: string;
  };
  pay: number;
  location: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  startTime: string;
  endTime: string;
  tags: string[];
  isComplete: boolean;
  userHired: string;
}

// Convert API responses to our display format
interface JobDisplay {
  id: string;
  name: string;
  company: string;
  pay: number;
  location: string;
  skills: string[];
  date: Date;
  coords?: [number, number];
}

export default function MyJobs() {
  const [appliedJobs, setAppliedJobs] = useState<JobDisplay[]>([]);
  const [rejectedJobs, setRejectedJobs] = useState<JobDisplay[]>([]);
  const [wonJobs, setWonJobs] = useState<JobDisplay[]>([]);
  const [pastJobs, setPastJobs] = useState<JobDisplay[]>([]);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending applications
        const pendingApplicationsResponse =
          await BackendAPI.shiftApi.getPendingApplications();
        processApplications(
          pendingApplicationsResponse as unknown as AxiosResponse<
            ShiftApplicant[]
          >
        );

        // Fetch user shifts (not upcoming = all shifts)
        const userShiftsResponse = await BackendAPI.shiftApi.getUserShifts(
          false
        );
        processUserShifts(userShiftsResponse);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processApplications = (response: AxiosResponse<ShiftApplicant[]>) => {
    if (response.data && Array.isArray(response.data)) {
      const applications = response.data;

      // Extract applied and rejected jobs
      const applied: JobDisplay[] = [];
      const rejected: JobDisplay[] = [];

      // Get all won job IDs to filter them out from applications
      const wonJobIds = new Set(wonJobs.map((job) => job.id));

      applications.forEach((app) => {
        if (!app.shift) return;

        // Skip if this job is already won
        if (wonJobIds.has(app.shift._id)) return;

        const jobDisplay: JobDisplay = {
          id: app._id,
          name: app.shift.name,
          company: app.shift.companyName || "Unknown Company",
          pay: app.shift.pay,
          location: `${app.shift.location.latitude}, ${app.shift.location.longitude}`,
          skills: app.shift.tags || [],
          date: new Date(app.shift.startTime),
          coords: app.shift.location
            ? [app.shift.location.latitude, app.shift.location.longitude]
            : undefined,
        };

        // If the application was rejected, add to rejected list
        if (app.rejected) {
          rejected.push(jobDisplay);
        }
        // If the shift is complete and not rejected, it should be in past jobs
        else if (app.shift.isComplete) {
          // Skip - this will be handled by processUserShifts
          return;
        }
        // Otherwise, it's an active application
        else {
          applied.push(jobDisplay);
        }
      });

      setAppliedJobs(applied);
      setRejectedJobs(rejected);
    }
  };

  const processUserShifts = (response: AxiosResponse<Shift[]>) => {
    if (response.data && Array.isArray(response.data)) {
      const shifts = response.data;

      // Separate into upcoming and past shifts
      const now = new Date();
      const upcoming: JobDisplay[] = [];
      const past: JobDisplay[] = [];

      shifts.forEach((shift) => {
        const shiftDate = new Date(shift.startTime);
        const jobDisplay: JobDisplay = {
          id: shift._id,
          name: shift.name,
          company: shift.company?.name || "Unknown Company",
          pay: shift.pay,
          location:
            shift.address ||
            (shift.location
              ? `${shift.location.latitude}, ${shift.location.longitude}`
              : "Unknown Location"),
          skills: shift.tags || [],
          date: shiftDate,
          coords: shift.location
            ? [shift.location.latitude, shift.location.longitude]
            : undefined,
        };

        if (shiftDate > now) {
          upcoming.push(jobDisplay);
        } else {
          past.push(jobDisplay);
        }
      });

      setWonJobs(upcoming);
      setPastJobs(past);
    }
  };

  const handleCancel = (jobId: string) => {
    Swal.fire({
      title: "Cancel Application",
      text: "Are you sure you want to cancel this application?",
      confirmButtonText: "OK",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "swal2-black-button",
        cancelButton: "swal2-black-button",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await BackendAPI.shiftApi.cancelApplication(jobId);
          // Remove from applied jobs
          setAppliedJobs((prev) => prev.filter((job) => job.id !== jobId));
          Swal.fire({
            title: "Application Cancelled",
            text: "Your application has been cancelled successfully.",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: "swal2-black-button",
            },
          });
        } catch (error) {
          console.error("Error cancelling application:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to cancel application. Please try again.",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: "swal2-black-button",
            },
          });
        }
      }
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
    jobs: JobDisplay[],
    actionType?: "cancel" | "contact"
  ) => (
    <div className="table-container my-10 p-4 bg-white rounded-lg shadow">
      <center>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      </center>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-4">No jobs found</div>
      ) : (
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
                onMouseEnter={() => setHoveredJobId(job.id)}
                onMouseLeave={() => setHoveredJobId(null)}
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
                          handleCancel(job.id);
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
      )}
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
