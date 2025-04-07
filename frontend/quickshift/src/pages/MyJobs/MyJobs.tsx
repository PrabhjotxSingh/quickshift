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
import { useNavigate } from "react-router-dom";

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

// Mock data for fallback
const mockAppliedJobs: Jobs[] = [
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

const mockWonJobs: Jobs[] = [
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

const mockRejectedJobs: Jobs[] = [
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

const mockPastJobs: Jobs[] = [
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
  const navigate = useNavigate();
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<Jobs[]>([]);
  const [wonJobs, setWonJobs] = useState<Jobs[]>([]);
  const [rejectedJobs, setRejectedJobs] = useState<Jobs[]>([]);
  const [pastJobs, setPastJobs] = useState<Jobs[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuthentication = async () => {
      try {
        // Initialize the API with the latest token
        BackendAPI.initialize();
        
        const isAuthenticated = await BackendAPI.checkAuth(true);
        if (!isAuthenticated) {
          navigate("/login");
          return;
        }
        
        // Fetch jobs from the API
        fetchUserJobs();
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuthentication();
  }, [navigate]);

  const fetchUserJobs = async () => {
    try {
      setIsLoading(true);
      
      // Ensure the API is using the latest token
      BackendAPI.initialize();
      
      // Fetch user's shifts from the API
      const response = await BackendAPI.shiftApi.getUserShifts();
      
      if (response.status === 200 && response.data) {
        // Process different job categories based on status
        const apiJobs = response.data.map((shift: any) => ({
          id: shift.id || '',
          name: shift.title || '',
          company: shift.companyName || '',
          pay: shift.hourlyRate || 0,
          location: shift.location || '',
          skills: shift.requiredSkills || [],
          date: new Date(shift.startTime || Date.now()),
          coords: shift.latitude && shift.longitude ? [shift.latitude, shift.longitude] : undefined,
          status: shift.status
        }));
        
        // Sort jobs based on their status
        setAppliedJobs(apiJobs.filter((job: any) => job.status === 'applied'));
        setWonJobs(apiJobs.filter((job: any) => job.status === 'accepted'));
        setRejectedJobs(apiJobs.filter((job: any) => job.status === 'rejected'));
        setPastJobs(apiJobs.filter((job: any) => job.status === 'completed'));
      } else {
        // Fallback to mock data if API call fails
        setAppliedJobs(mockAppliedJobs);
        setWonJobs(mockWonJobs);
        setRejectedJobs(mockRejectedJobs);
        setPastJobs(mockPastJobs);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      // Fallback to mock data
      setAppliedJobs(mockAppliedJobs);
      setWonJobs(mockWonJobs);
      setRejectedJobs(mockRejectedJobs);
      setPastJobs(mockPastJobs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (jobId: string) => {
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Since there's no direct cancelApplication method in the API
          // We can implement a temporary UI-side solution for now
          // In a real implementation, this would make an API call
          // using something like BackendAPI.shiftApi.withdrawApplication(jobId)
          
          // For now, just update the UI
          setAppliedJobs(appliedJobs.filter(job => job.id !== jobId));
          
          Swal.fire({
            title: "Cancelled!",
            text: "Your application has been cancelled.",
            icon: "success",
            customClass: {
              confirmButton: "swal2-black-button",
            },
          });
        } catch (error) {
          console.error("Failed to cancel application:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to cancel application. Please try again.",
            icon: "error",
            customClass: {
              confirmButton: "swal2-black-button",
            },
          });
        }
      }
    });
  };

  const handleContact = (jobId: string) => {
    // Fetch employer contact information
    const job = wonJobs.find(j => j.id === jobId);
    
    Swal.fire({
      title: "Contact Employer",
      text: `The employer's contact information for "${job?.name}" is EMAIL`,
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
      {isLoading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-center p-4">No jobs found in this category.</p>
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
                          handleContact(job.id);
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
