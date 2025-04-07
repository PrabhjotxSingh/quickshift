import { useEffect, useState } from "react";
import { Navbar1 } from "../Parts/Topbar/Topbar";
import "./PostJobs.css";
import { BackendAPI } from "@/lib/backend/backend-api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { CreateShiftRequest } from "../../backend-api";

type Job = {
  id: string;
  name: string;
  company: string;
  pay: number;
  location: string;
  applicants: { id: string; username: string }[];
  acceptedApplicant?: string;
};

export default function PostJobs() {
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    pay: "",
    location: "",
    startTime: "",
    endTime: "",
    requiredSkills: "",
  });
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Fetch posted jobs
        fetchPostedJobs();
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuthentication();
  }, [navigate]);

  const fetchPostedJobs = async () => {
    try {
      setIsLoading(true);
      // Ensure the API is using the latest token
      BackendAPI.initialize();
      
      // Get company info first, then fetch shifts
      const companyResponse = await BackendAPI.companyApi.getRequestingUserCompany();
      
      if (companyResponse.status === 200 && companyResponse.data) {
        const companyId = companyResponse.data.id;
        
        // Now get all available shifts
        const shiftsResponse = await BackendAPI.shiftApi.getAvailableShifts();
        
        if (shiftsResponse.status === 200 && shiftsResponse.data) {
          // Filter shifts that belong to this company
          const companyShifts = shiftsResponse.data.filter((shift: any) => 
            shift.companyId === companyId
          );
          
          // Transform API data to match our Job type
          const jobs: Job[] = await Promise.all(companyShifts.map(async (shift: any) => {
            // Get applicants for each shift
            let applicants: { id: string; username: string }[] = [];
            try {
              const applicantsResponse = await BackendAPI.shiftApi.getApplicants(shift.id);
              if (applicantsResponse.status === 200 && applicantsResponse.data) {
                applicants = applicantsResponse.data.map((applicant: any) => ({
                  id: applicant.userId || applicant.id,
                  username: applicant.username || applicant.firstName || 'Unknown'
                }));
              }
            } catch (err) {
              console.error(`Failed to fetch applicants for shift ${shift.id}:`, err);
            }
            
            return {
              id: shift.id,
              name: shift.title,
              company: shift.companyName || companyResponse.data.name,
              pay: shift.hourlyRate,
              location: shift.location,
              applicants: applicants,
              acceptedApplicant: shift.acceptedApplicantId
            };
          }));
          
          setPostedJobs(jobs);
        }
      }
    } catch (error) {
      console.error("Failed to fetch posted jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostJob = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.pay || !formData.location || 
          !formData.startTime || !formData.endTime) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all required fields",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
      
      // Ensure the API is using the latest token
      BackendAPI.initialize();
      
      // Get company info
      const companyResponse = await BackendAPI.companyApi.getRequestingUserCompany();
      if (companyResponse.status !== 200 || !companyResponse.data) {
        throw new Error("Failed to get company information");
      }
      
      // Create shift request object
      const createShiftRequest: CreateShiftRequest = {
        name: formData.name,
        description: "Job posted through QuickShift platform", // Default description
        company: companyResponse.data.id,
        tags: formData.requiredSkills.split(',').map(skill => skill.trim()),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        pay: parseFloat(formData.pay),
        location: {
          latitude: 39.103119, // Default to Cincinnati coordinates
          longitude: -84.512016
        }
      };

      // Post to the API
      const response = await BackendAPI.shiftApi.create(createShiftRequest);
      
      if (response.status === 200 || response.status === 201) {
        // Success notification
        Swal.fire({
          title: "Success!",
          text: "Job has been posted successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        
        // Reset form
        setFormData({
          name: "",
          company: "",
          pay: "",
          location: "",
          startTime: "",
          endTime: "",
          requiredSkills: "",
        });
        
        // Refresh job listings
        fetchPostedJobs();
      }
    } catch (error) {
      console.error("Failed to post job:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to post job. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleAcceptApplicant = async (jobId: string, applicantId: string) => {
    try {
      await BackendAPI.shiftApi.hireUser(jobId, applicantId);
      
      // Update UI
      setPostedJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, acceptedApplicant: applicantId } : job
        )
      );
      
      Swal.fire({
        title: "Success!",
        text: "Applicant has been accepted for the job",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Failed to accept applicant:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to accept applicant. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const upcomingJobs = postedJobs.filter((job) => job.acceptedApplicant);

  return (
    <>
      <Navbar1 />
      <div className="p-6 max-w-4xl mx-auto space-y-10">
        <h1 className="text-2xl font-bold">Post a Job</h1>
        <div className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleInput}
            placeholder="Job Title"
            className="border px-3 py-2 w-full"
          />
          <input
            name="company"
            value={formData.company}
            onChange={handleInput}
            placeholder="Company"
            className="border px-3 py-2 w-full"
          />
          <input
            name="pay"
            value={formData.pay}
            onChange={handleInput}
            placeholder="Pay (hourly rate)"
            className="border px-3 py-2 w-full"
            type="number"
          />
          <input
            name="location"
            value={formData.location}
            onChange={handleInput}
            placeholder="Location"
            className="border px-3 py-2 w-full"
          />
          <input
            name="startTime"
            value={formData.startTime}
            onChange={handleInput}
            placeholder="Start Time"
            className="border px-3 py-2 w-full"
            type="datetime-local"
          />
          <input
            name="endTime"
            value={formData.endTime}
            onChange={handleInput}
            placeholder="End Time"
            className="border px-3 py-2 w-full"
            type="datetime-local"
          />
          <input
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleInput}
            placeholder="Required Skills (comma separated)"
            className="border px-3 py-2 w-full"
          />
          <button
            onClick={handlePostJob}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Post Job
          </button>
        </div>

        {isLoading ? (
          <p>Loading jobs...</p>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mt-10">Posted Jobs</h2>
            {postedJobs.length === 0 ? (
              <p className="my-4">You haven't posted any jobs yet.</p>
            ) : (
              postedJobs.map((job) => (
                <div key={job.id} className="border p-4 mt-4 rounded">
                  <h3 className="font-bold">{job.name}</h3>
                  <p>{job.company}</p>
                  <p>
                    ${job.pay}/hr — {job.location}
                  </p>

                  {!job.acceptedApplicant ? (
                    <>
                      <p className="mt-2 font-medium">Applicants:</p>
                      {job.applicants.length === 0 ? (
                        <p className="text-sm text-gray-500">No applications yet</p>
                      ) : (
                        <ul className="space-y-1">
                          {job.applicants.map((applicant) => (
                            <li
                              key={applicant.id}
                              className="flex items-center justify-between"
                            >
                              <span>{applicant.username}</span>
                              <button
                                onClick={() =>
                                  handleAcceptApplicant(job.id, applicant.id)
                                }
                                className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                              >
                                Accept
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-green-600 font-semibold">
                      Accepted: {job.applicants.find(a => a.id === job.acceptedApplicant)?.username || 'Applicant'}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {upcomingJobs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-10">Upcoming Jobs</h2>
            <ul className="space-y-3 mt-4">
              {upcomingJobs.map((job) => (
                <li key={job.id} className="bg-gray-100 p-4 rounded shadow-sm">
                  <strong>{job.name}</strong> with{" "}
                  <em>{job.applicants.find(a => a.id === job.acceptedApplicant)?.username || 'Applicant'}</em> at {job.company}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
