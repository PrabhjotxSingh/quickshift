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

type Job = {
  id: string;
  name: string;
  company: string;
  pay: number;
  location: string;
  applicants: Applicant[];
  acceptedApplicant?: string;
};

type Applicant = {
  id: string;
  userId: string;
  userData?: UserDto;
};

export default function PostJobs() {
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
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

              {!job.acceptedApplicant ? (
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
              ) : (
                <p className="mt-2 text-green-600 font-semibold">
                  Accepted: {job.acceptedApplicant}
                </p>
              )}
            </div>
          ))}
        </div>

        {upcomingJobs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-10">Upcoming Jobs</h2>
            <ul className="space-y-3 mt-4">
              {upcomingJobs.map((job) => (
                <li key={job.id} className="bg-gray-100 p-4 rounded shadow-sm">
                  <strong>{job.name}</strong> with{" "}
                  <em>{job.acceptedApplicant}</em> at {job.company}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
