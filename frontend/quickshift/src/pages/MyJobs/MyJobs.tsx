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
import { useEffect, useState, useRef, useCallback } from "react";
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
  companyName?: string;
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

  // Add pagination state
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const PAGE_SIZE = 10;

  // Add ref for intersection observer
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchInitialData();
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      await Promise.all([fetchPendingApplications(0), fetchUserShifts()]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setLoading(false);
    }
  };

  const fetchPendingApplications = async (pageNum: number) => {
    try {
      const pendingApplicationsResponse =
        await BackendAPI.shiftApi.getPendingApplications(
          pageNum * PAGE_SIZE,
          PAGE_SIZE
        );

      const applications = pendingApplicationsResponse.data as ShiftApplicant[];
      if (!applications || applications.length < PAGE_SIZE) {
        setHasMore(false);
      }

      processApplications(
        { data: applications } as AxiosResponse<ShiftApplicant[]>,
        pageNum === 0
      );
    } catch (error) {
      console.error("Error fetching pending applications:", error);
    }
  };

  const fetchUserShifts = async () => {
    try {
      const userShiftsResponse = await BackendAPI.shiftApi.getUserShifts(false);
      processUserShifts(userShiftsResponse);
    } catch (error) {
      console.error("Error fetching user shifts:", error);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const nextPage = page + 1;
    await fetchPendingApplications(nextPage);
    setPage(nextPage);
    setLoading(false);
  };

  const processApplications = (
    response: AxiosResponse<ShiftApplicant[]>,
    isFirstPage: boolean
  ) => {
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

        if (app.rejected) {
          rejected.push(jobDisplay);
        } else if (app.shift.isComplete) {
          return;
        } else {
          applied.push(jobDisplay);
        }
      });

      // Update state based on whether this is the first page or not
      setAppliedJobs((prev) => (isFirstPage ? applied : [...prev, ...applied]));
      setRejectedJobs((prev) =>
        isFirstPage ? rejected : [...prev, ...rejected]
      );
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
          company: shift.companyName || "Unknown Company",
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
      {loading && jobs.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-2"></div>
          <span className="text-gray-600">Loading jobs...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-4">No jobs found</div>
      ) : (
        <>
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
          {title === "Applied Jobs" && (
            <div ref={loadingRef} className="text-center py-4">
              {loading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                  <span className="text-sm text-gray-500">Loading more...</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <Navbar1 />
      <div className="px-6 py-10 max-w-6xl mx-auto">
        {renderTable("Hired Jobs", wonJobs)}
        {renderTable("Applied Jobs", appliedJobs, "cancel")}
        {renderTable("Rejected Jobs", rejectedJobs)}
        {renderTable("Complete Jobs", pastJobs)}
      </div>
    </>
  );
}
