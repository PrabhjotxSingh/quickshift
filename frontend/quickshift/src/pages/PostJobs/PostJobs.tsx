import { useState } from "react";
import { Navbar1 } from "../Parts/Topbar/Topbar";
import "./PostJobs.css";

type Job = {
  id: string;
  name: string;
  company: string;
  pay: number;
  location: string;
  applicants: string[];
  acceptedApplicant?: string;
};

export default function PostJobs() {
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    pay: "",
    location: "",
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostJob = () => {
    const newJob: Job = {
      id: Date.now().toString(),
      name: formData.name,
      company: formData.company,
      pay: parseFloat(formData.pay),
      location: formData.location,
      applicants: ["Alice", "Bob", "Charlie"], // mock applicants
    };
    setPostedJobs([...postedJobs, newJob]);
    setFormData({ name: "", company: "", pay: "", location: "" });
  };

  const handleAcceptApplicant = (jobId: string, applicant: string) => {
    setPostedJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, acceptedApplicant: applicant } : job
      )
    );
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
            placeholder="Pay"
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
                        key={applicant}
                        className="flex items-center justify-between"
                      >
                        <span>{applicant}</span>
                        <button
                          onClick={() =>
                            handleAcceptApplicant(job.id, applicant)
                          }
                          className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                      </li>
                    ))}
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
