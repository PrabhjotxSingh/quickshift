import { useState, useEffect } from "react";
import { Navbar1 } from "../Parts/Topbar/Topbar";
import "./PostJobs.css";
import Swal from "sweetalert2";
import { BackendAPI } from "../../lib/backend/backend-api";
import {
  CreateCompanyRequest,
  CreateShiftRequest,
  Location,
  ShiftDto,
  ShiftApplicantDto,
  UserDto,
} from "../../backend-api/models";
import AddressAutocomplete from "../../components/AddressAutocomplete";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Job = {
  id: string;
  name: string;
  company: string;
  pay: number;
  location: string;
  applicants: Applicant[];
  acceptedApplicant?: string;
  completed?: boolean;
  tags?: string[];
  rating?: number;
};

type Applicant = {
  id: string;
  userId: string;
  userData?: UserDto;
};

export default function PostJobs() {
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [jobRatings, setJobRatings] = useState<{ [key: string]: number }>({});
  const [skillsInput, setSkillsInput] = useState("");
  const [isViewingCompletedJobs, setIsViewingCompletedJobs] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedUserCompletedJobs, setSelectedUserCompletedJobs] = useState<
    Job[]
  >([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    pay: "",
    location: "",
    description: "",
    startTime: "",
    endTime: "",
    tags: [] as string[],
  });
  const [locationCoords, setLocationCoords] = useState<Location>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        // Initialize the BackendAPI
        BackendAPI.initialize();

        // Check if user is authenticated
        const isAuthenticated = await BackendAPI.checkAuth();
        if (!isAuthenticated) {
          window.location.href = "/login";
          return;
        }

        // Try to get the company name from the backend
        try {
          const companyResponse =
            await BackendAPI.companyApi.getRequestingUserCompany();
          if (companyResponse.status === 200 && companyResponse.data) {
            setFormData((prev) => ({
              ...prev,
              company: companyResponse.data.name,
            }));
            setCompanyId(companyResponse.data.id);
          } else {
            // If no company exists, prompt the user to create one
            promptForCompanyName();
          }
        } catch (error) {
          console.error("Error fetching company:", error);
          promptForCompanyName();
        }
      } catch (error) {
        console.error("Error in fetchCompanyName:", error);
        promptForCompanyName();
      }
    };

    const promptForCompanyName = async () => {
      let userCompany = "";
      let companyDescription = "";

      while (!userCompany) {
        const {
          value: inputCompany,
          isConfirmed,
          isDismissed,
        } = await Swal.fire({
          title: "Enter Company Name",
          input: "text",
          inputLabel: "Your company name is required to post jobs.",
          inputPlaceholder: "e.g., Bob's Bakery",
          showCancelButton: true,
          confirmButtonText: "Continue",
          cancelButtonText: "Cancel",
          customClass: {
            confirmButton: "swal2-black-button",
          },
          inputValidator: (value) => {
            if (!value.trim()) {
              return "Please enter a company name!";
            }
            return null;
          },
          allowOutsideClick: false,
        });

        if (isDismissed) {
          window.location.href = "/dashboard";
          return;
        }

        if (isConfirmed && inputCompany?.trim()) {
          userCompany = inputCompany.trim();

          // Now ask for company description
          const {
            value: inputDescription,
            isConfirmed: descConfirmed,
            isDismissed: descDismissed,
          } = await Swal.fire({
            title: "Enter Company Description",
            input: "textarea",
            inputLabel: "Please provide a brief description of your company.",
            inputPlaceholder:
              "e.g., A family-owned bakery serving fresh bread and pastries since 1995.",
            showCancelButton: true,
            confirmButtonText: "Continue",
            cancelButtonText: "Cancel",
            customClass: {
              confirmButton: "swal2-black-button",
            },
            inputValidator: (value) => {
              if (!value.trim()) {
                return "Please enter a company description!";
              }
              return null;
            },
            allowOutsideClick: false,
          });

          if (descDismissed) {
            window.location.href = "/dashboard";
            return;
          }

          if (descConfirmed && inputDescription?.trim()) {
            companyDescription = inputDescription.trim();

            // Create the company using the BackendAPI
            try {
              const createCompanyRequest: CreateCompanyRequest = {
                name: userCompany,
                description: companyDescription,
              };

              const response = await BackendAPI.companyApi.createCompany(
                createCompanyRequest
              );

              if (response.status === 200 && response.data) {
                setFormData((prev) => ({ ...prev, company: userCompany }));
                setCompanyId(response.data.id);

                Swal.fire({
                  title: "Company Created!",
                  text: "Your company has been successfully created.",
                  icon: "success",
                  confirmButtonText: "Great!",
                  customClass: {
                    confirmButton: "swal2-black-button",
                  },
                });
              } else {
                throw new Error("Failed to create company");
              }
            } catch (error) {
              console.error("Error creating company:", error);
              Swal.fire({
                title: "Error",
                text: "Failed to create company. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                  confirmButton: "swal2-black-button",
                },
              });
            }
          }
        }
      }
    };

    fetchCompanyName();

    // Fetch open shifts for the company
    const fetchOpenShifts = async () => {
      if (companyId) {
        try {
          const response = await BackendAPI.shiftApi.getCompanyOpenShifts(
            companyId
          );
          if (response.status === 200 && response.data) {
            // Process the open shifts
            const shifts = response.data as ShiftDto[];

            // For each shift, get the applicants
            const shiftsWithApplicants = await Promise.all(
              shifts.map(async (shift: ShiftDto) => {
                try {
                  const applicantsResponse =
                    await BackendAPI.shiftApi.getApplicants(shift._id);
                  const applicants =
                    applicantsResponse.status === 200
                      ? (applicantsResponse.data as ShiftApplicantDto[])
                      : [];

                  return {
                    id: shift._id,
                    name: shift.name,
                    company: shift.companyName,
                    pay: shift.pay,
                    location: `${shift.location.latitude}, ${shift.location.longitude}`,
                    applicants: applicants.map((app: ShiftApplicantDto) => ({
                      id: app._id,
                      userId: app.user,
                      userData: app.userData,
                    })),
                    acceptedApplicant: shift.userHired,
                    completed: shift.isComplete || false,
                    tags: shift.tags || [],
                  };
                } catch (error) {
                  console.error(
                    `Error fetching applicants for shift ${shift._id}:`,
                    error
                  );
                  return {
                    id: shift._id,
                    name: shift.name,
                    company: shift.companyName,
                    pay: shift.pay,
                    location: `${shift.location.latitude}, ${shift.location.longitude}`,
                    applicants: [],
                    acceptedApplicant: shift.userHired,
                    completed: false,
                    tags: [],
                  };
                }
              })
            );

            setPostedJobs(shiftsWithApplicants);
          }
        } catch (error) {
          console.error("Error fetching open shifts:", error);
        }
      }
    };

    fetchOpenShifts();
  }, [companyId]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressSelect = (
    address: string,
    latitude: number,
    longitude: number
  ) => {
    console.log("Address selected:", { address, latitude, longitude });
    setFormData({ ...formData, location: address });
    setLocationCoords({ latitude, longitude });
    console.log("Updated locationCoords:", { latitude, longitude });
  };

  const handleSkillsSubmit = () => {
    const skillsArray = skillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    if (skillsArray.length > 0) {
      setFormData({
        ...formData,
        tags: [...formData.tags, ...skillsArray],
      });
      setSkillsInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((skill) => skill !== skillToRemove),
    });
  };

  const handlePostJob = async () => {
    if (!companyId) {
      Swal.fire({
        title: "Error",
        text: "You need to create a company first.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "swal2-black-button",
        },
      });
      return;
    }

    // Ensure a valid location is selected from AddressAutocomplete
    if (locationCoords.latitude === 0 && locationCoords.longitude === 0) {
      Swal.fire({
        title: "Error",
        text: "Please select a valid job location from the suggestions.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "swal2-black-button",
        },
      });
      return;
    }

    try {
      console.log("Submitting job with location coords:", locationCoords);

      // Create the shift request with the coordinates from the selected address
      const createShiftRequest: CreateShiftRequest = {
        name: formData.name,
        description: formData.description || "No description provided",
        company: companyId,
        tags: formData.tags,
        startTime: formData.startTime || new Date().toISOString(),
        endTime:
          formData.endTime || new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        pay: parseFloat(formData.pay),
        location: locationCoords,
      };

      console.log("Create shift request:", createShiftRequest);

      // Call the API to create the shift
      const response = await BackendAPI.shiftApi.create(createShiftRequest);

      if (response.status === 200 && response.data) {
        // Add the new job to the list
        const newJob: Job = {
          id: response.data._id || Date.now().toString(),
          name: formData.name,
          company: formData.company,
          pay: parseFloat(formData.pay),
          location: formData.location,
          applicants: [],
          tags: formData.tags,
        };

        setPostedJobs([...postedJobs, newJob]);

        // Reset form
        setFormData({
          ...formData,
          name: "",
          pay: "",
          location: "",
          description: "",
          startTime: "",
          endTime: "",
          tags: [],
        });

        Swal.fire({
          title: "Job Posted!",
          text: "Your job has been successfully posted.",
          icon: "success",
          confirmButtonText: "Great!",
          customClass: {
            confirmButton: "swal2-black-button",
          },
        });
      } else {
        throw new Error("Failed to create shift");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to post job. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "swal2-black-button",
        },
      });
    }
  };

  const handleAcceptApplicant = async (jobId: string, applicantId: string) => {
    try {
      // Call the API to hire the user
      const response = await BackendAPI.shiftApi.hireUser(jobId, applicantId);

      if (response.status === 200) {
        // Update the local state
        setPostedJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? { ...job, acceptedApplicant: applicantId } : job
          )
        );

        Swal.fire({
          title: "Applicant Hired!",
          text: "The applicant has been successfully hired for this job.",
          icon: "success",
          confirmButtonText: "Great!",
          customClass: {
            confirmButton: "swal2-black-button",
          },
        });
      } else {
        throw new Error("Failed to hire applicant");
      }
    } catch (error) {
      console.error("Error hiring applicant:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to hire applicant. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "swal2-black-button",
        },
      });
    }
  };

  const handleDenyApplicant = async (applicationId: string) => {
    try {
      // Call the API to deny the applicant
      const response = await BackendAPI.shiftApi.denyApplicant(applicationId);

      if (response.status === 200) {
        // Update the local state to remove the denied applicant
        setPostedJobs((prevJobs) =>
          prevJobs.map((job) => ({
            ...job,
            applicants: job.applicants.filter(
              (applicant) => applicant.id !== applicationId
            ),
          }))
        );

        Swal.fire({
          title: "Applicant Denied",
          text: "The applicant has been denied for this job.",
          icon: "info",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "swal2-black-button",
          },
        });
      } else {
        throw new Error("Failed to deny applicant");
      }
    } catch (error) {
      console.error("Error denying applicant:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to deny applicant. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "swal2-black-button",
        },
      });
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    try {
      const rating = jobRatings[jobId] || 50; // Default to 50 if no rating set
      const response = await BackendAPI.shiftApi.completeShift(jobId, rating);
      if (response.status === 200) {
        setPostedJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? { ...job, completed: true } : job
          )
        );
        Swal.fire({
          title: "Job Completed!",
          text: "The job has been marked as complete.",
          icon: "success",
          confirmButtonText: "Great!",
          customClass: { confirmButton: "swal2-black-button" },
        });
      } else {
        throw new Error("Failed to complete job");
      }
    } catch (error) {
      console.error("Error completing job:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to complete job. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: { confirmButton: "swal2-black-button" },
      });
    }
  };

  const upcomingJobs = postedJobs.filter(
    (job) => job.acceptedApplicant && !job.completed
  );

  const closeCompletedJobsModal = () => {
    setIsViewingCompletedJobs(false);
    setSelectedUserName("");
    setSelectedUserCompletedJobs([]);
  };

  const handleViewCompletedJobs = async (userId: string, userName: string) => {
    try {
      const response = await BackendAPI.shiftApi.getUserShifts(false, userId);
      if (response.status === 200 && response.data) {
        const completedJobs = response.data
          .filter((shift: ShiftDto) => shift.isComplete)
          .map((shift: ShiftDto) => ({
            id: shift._id,
            name: shift.name,
            company: shift.companyName,
            pay: shift.pay,
            location: `${shift.location.latitude}, ${shift.location.longitude}`,
            rating: shift.rating,
            completed: true,
          }));
        setSelectedUserCompletedJobs(completedJobs);
        setSelectedUserName(userName);
        setIsViewingCompletedJobs(true);
      }
    } catch (error) {
      console.error("Error fetching completed jobs:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch completed jobs. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "swal2-black-button",
        },
      });
    }
  };

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
            disabled
          />
          <input
            name="pay"
            value={formData.pay}
            onChange={handleInput}
            placeholder="Pay"
            className="border px-3 py-2 w-full"
            type="number"
          />
          <AddressAutocomplete
            onAddressSelect={handleAddressSelect}
            placeholder="Enter job location"
            className="border px-3 py-2 w-full"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Job Description"
            className="border px-3 py-2 w-full"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              name="startTime"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              placeholder="Start Time"
              className="border px-3 py-2 w-full"
              type="datetime-local"
            />
            <input
              name="endTime"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              placeholder="End Time"
              className="border px-3 py-2 w-full"
              type="datetime-local"
            />
          </div>

          {/* Skills Input - Redesigned to be more integrated */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Required Skills</label>
              <span className="text-xs text-gray-500">
                Use commas to separate skills
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g., driving, cleaning, software"
                className="flex-1"
              />
              <Button onClick={handleSkillsSubmit} size="sm">
                Add
              </Button>
            </div>
            <div className="mt-2">
              {formData.tags && formData.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {formData.tags.map((skill, index) => (
                    <li key={index} className="relative group">
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="px-2 py-0.5 bg-gray-200 rounded-full transition-colors duration-300 group-hover:bg-red-500 group-hover:text-white cursor-pointer text-sm"
                      >
                        <span>{skill}</span>
                        <span className="ml-1 text-red-500 group-hover:text-white">
                          X
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No skills added.</p>
              )}
            </div>
          </div>

          <button
            onClick={handlePostJob}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Post Job
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-10">Posted Jobs</h2>
          {postedJobs.map((job) => (
            <div key={job.id} className="border p-4 mt-4 rounded">
              <h3 className="font-bold">{job.name}</h3>
              <p>{job.company}</p>
              <p>
                ${job.pay}/hr — {job.location}
              </p>
              {job.tags && job.tags.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Required Skills:</p>
                  <ul className="flex flex-wrap gap-2 mt-1">
                    {job.tags.map((tag, index) => (
                      <li
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.acceptedApplicant ? (
                <>
                  <p className="mt-2 text-green-600 font-semibold">
                    Accepted:{" "}
                    {job.applicants.find(
                      (app) => app.userId === job.acceptedApplicant
                    )?.userData
                      ? `${
                          job.applicants.find(
                            (app) => app.userId === job.acceptedApplicant
                          )?.userData?.firstName
                        } ${
                          job.applicants.find(
                            (app) => app.userId === job.acceptedApplicant
                          )?.userData?.lastName
                        }`
                      : job.acceptedApplicant}
                  </p>

                  {/* Add email for the accepted user */}
                  {job.applicants.find(
                    (app) => app.userId === job.acceptedApplicant
                  )?.userData?.email && (
                    <p className="text-sm text-gray-600">
                      Email:{" "}
                      {
                        job.applicants.find(
                          (app) => app.userId === job.acceptedApplicant
                        )?.userData?.email
                      }
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="mt-2 font-medium">Applicants:</p>
                  <ul className="space-y-1">
                    {job.applicants.map((applicant) => (
                      <li
                        key={applicant.id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {applicant.userData
                              ? `${applicant.userData.firstName} ${applicant.userData.lastName}`
                              : "User information not available"}
                          </p>
                          {applicant.userData && (
                            <div className="text-sm text-gray-600">
                              <p>
                                <span className="mr-2">
                                  {applicant.userData.username}
                                </span>
                                <span>{applicant.userData.email}</span>
                              </p>
                              {applicant.userData.skills &&
                                applicant.userData.skills.length > 0 && (
                                  <p>
                                    Skills:{" "}
                                    {applicant.userData.skills.join(", ")}
                                  </p>
                                )}
                              <button
                                onClick={() => {
                                  if (applicant.userData) {
                                    handleViewCompletedJobs(
                                      applicant.userId,
                                      `${applicant.userData.firstName} ${applicant.userData.lastName}`
                                    );
                                  }
                                }}
                                className="text-sm text-blue-500 hover:text-blue-700 mt-1"
                              >
                                View Completed Jobs
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() =>
                              handleAcceptApplicant(job.id, applicant.userId)
                            }
                            className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDenyApplicant(applicant.id)}
                            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Deny
                          </button>
                        </div>
                      </li>
                    ))}
                    {job.applicants.length === 0 && (
                      <li className="text-gray-500 italic">
                        No applicants yet
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>

        {upcomingJobs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-10">Upcoming Jobs</h2>
            <ul className="space-y-3 mt-4">
              {upcomingJobs.map((job) => (
                <li key={job.id} className="border p-4 rounded">
                  <h3 className="font-bold">{job.name}</h3>
                  <p>{job.company}</p>
                  <p>
                    ${job.pay}/hr — {job.location}
                  </p>
                  {job.tags && job.tags.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Required Skills:</p>
                      <ul className="flex flex-wrap gap-2 mt-1">
                        {job.tags.map((tag, index) => (
                          <li
                            key={index}
                            className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="mt-2 text-green-600 font-semibold">
                    Accepted:{" "}
                    {job.applicants.find(
                      (app) => app.userId === job.acceptedApplicant
                    )?.userData
                      ? `${
                          job.applicants.find(
                            (app) => app.userId === job.acceptedApplicant
                          )?.userData?.firstName
                        } ${
                          job.applicants.find(
                            (app) => app.userId === job.acceptedApplicant
                          )?.userData?.lastName
                        }`
                      : job.acceptedApplicant}
                  </p>

                  {/* Add email for the accepted user */}
                  {job.applicants.find(
                    (app) => app.userId === job.acceptedApplicant
                  )?.userData?.email && (
                    <p className="text-sm text-gray-600">
                      Email:{" "}
                      {
                        job.applicants.find(
                          (app) => app.userId === job.acceptedApplicant
                        )?.userData?.email
                      }
                    </p>
                  )}

                  {!job.completed && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium">
                          Rating (0-100):
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={jobRatings[job.id] || 50}
                          onChange={(e) =>
                            setJobRatings((prev) => ({
                              ...prev,
                              [job.id]: parseInt(e.target.value),
                            }))
                          }
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {jobRatings[job.id] || 50}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCompleteJob(job.id)}
                        className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded"
                      >
                        Complete Job
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal for viewing completed jobs */}
        {isViewingCompletedJobs && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedUserName}'s Completed Jobs
                </h2>
                <button
                  onClick={closeCompletedJobsModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {selectedUserCompletedJobs.length > 0 ? (
                <div className="space-y-3">
                  {selectedUserCompletedJobs.map((job) => (
                    <div key={job.id} className="border p-3 rounded">
                      <h3 className="font-semibold">{job.name}</h3>
                      <p>Company: {job.company}</p>
                      <p>Pay: ${job.pay}/hr</p>
                      {job.rating !== undefined && (
                        <p>Rating: {job.rating} / 100</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center italic text-gray-500">
                  This user has no completed jobs.
                </p>
              )}

              <div className="mt-4 text-center">
                <button
                  onClick={closeCompletedJobsModal}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
