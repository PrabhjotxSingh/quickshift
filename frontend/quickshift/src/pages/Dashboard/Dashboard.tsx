import { useEffect, useState } from "react";
import { Navbar1 } from "../Parts/Topbar/Topbar";
import "./Dashboard.css";
import markerIcon from "@/assets/marker.png";
import { Circle } from "react-leaflet";
import { BackendAPI } from "@/lib/backend/backend-api";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Slider } from "@/components/ui/slider";

import { Checkbox } from "@/components/ui/checkbox";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconSize: [25, 25],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const customIconLarge = new L.Icon({
  iconUrl: markerIcon,
  iconSize: [35, 35], // Larger than 25x25
  iconAnchor: [17, 45],
  popupAnchor: [1, -34],
});

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

const userSkills = ["driving"];

const jobs: Jobs[] = [
  {
    id: "1",
    name: "Dishwasher",
    company: "Downtown Diner",
    pay: 15,
    location: "14 E 47th St, New York, NY 10017",
    skills: ["Cleaning", "Teamwork", "Time Management"],
    date: new Date("2025-03-01"),
    coords: [40.755, -73.981],
  },
  {
    id: "2",
    name: "Warehouse Worker",
    company: "LogiCorp",
    pay: 18,
    location: "1100 Fillmore St, San Francisco, CA 94102",
    skills: ["Lifting", "Packing", "Inventory Management"],
    date: new Date("2025-02-20"),
    coords: [37.779, -122.426],
  },
  {
    id: "3",
    name: "Cashier",
    company: "SuperMart",
    pay: 14,
    location: "Remote",
    skills: ["Customer Service", "POS System", "Math Skills"],
    date: new Date("2025-03-15"),
  },
  {
    id: "4",
    name: "Janitor",
    company: "SecureNet",
    pay: 16,
    location: "1235 New York Ave NW, Washington, DC 20005",
    skills: ["Cleaning", "Maintenance", "Organization"],
    date: new Date("2025-03-10"),
    coords: [38.9, -77.028],
  },
  {
    id: "5",
    name: "Delivery Driver",
    company: "FastTrack Deliveries",
    pay: 20,
    location: "2810 S Figueroa St, Los Angeles, CA 90007",
    skills: ["Driving", "Navigation", "Customer Service"],
    date: new Date("2025-02-28"),
    coords: [34.022, -118.282],
  },
  {
    id: "6",
    name: "Hotel Room Cleaner",
    company: "Holiday Inn",
    pay: 20,
    location: "123 Ohio rd",
    skills: ["Driving", "Navigation", "Customer Service"],
    date: new Date("2025-02-28"),
    coords: [39.103119, -84.512016],
  },
  {
    id: "7",
    name: "Dishwasher",
    company: "Downtown Diner",
    pay: 20,
    location: "1234 Ohio rd",
    skills: ["Driving", "Navigation", "Customer Service"],
    date: new Date("2025-02-28"),
    coords: [39.1753, -84.2944],
  },
];

function getDistanceFromLatLonInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function matchesUserSkills(job: Jobs, skills: string[]) {
  return job.skills.some((skill) =>
    skills.some((userSkill) => userSkill.toLowerCase() === skill.toLowerCase())
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [filteredJobs, setFilteredJobs] = useState<Jobs[]>([]);
  const [allJobs, setAllJobs] = useState<Jobs[]>([]);
  const [radius, setRadius] = useState(50);
  const [includeRemote, setIncludeRemote] = useState(false);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Jobs | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useLocalDataOnly, setUseLocalDataOnly] = useState(false);

  const openJobDetails = (job: Jobs) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setShowModal(false);
  };

  useEffect(() => {
    // Check if user is authenticated
    const checkAuthentication = async () => {
      try {
        console.log("Dashboard: Checking authentication...");
        
        // First check if we have a token
        const token = localStorage.getItem("quickshift_access_token");
        if (!token) {
          console.log("Dashboard: No token found, redirecting to login");
          navigate("/login");
          return;
        }
        
        console.log("Dashboard: Token found, initializing API");
        // Initialize the API with the latest token before checking auth
        BackendAPI.initialize(token);
        
        // Try to refresh the token to ensure it's valid
        try {
          console.log("Dashboard: Attempting token refresh");
          await BackendAPI.refresh();
          console.log("Dashboard: Token refreshed successfully");
        } catch (refreshError) {
          console.error("Dashboard: Token refresh failed, using existing token", refreshError);
          // Continue with existing token
        }
        
        const isAuthenticated = await BackendAPI.checkAuth(false);
        if (!isAuthenticated) {
          console.log("Dashboard: Not authenticated, redirecting to login");
          navigate("/login");
          return;
        }
        
        console.log("Dashboard: Authentication successful");
        
        // Get user location and fetch jobs
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoords([position.coords.latitude, position.coords.longitude]);
            fetchJobs();
          },
          (err) => {
            console.error("Failed to get user location:", err);
            fetchJobs();
          }
        );
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuthentication();
  }, [navigate]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      // If useLocalDataOnly is true, skip API call and use local data
      if (useLocalDataOnly) {
        console.log("Using local job data only (bypassing API)");
        setAllJobs(jobs);
        filterJobsByRadius(jobs);
        setIsLoading(false);
        return;
      }

      // Make sure we're using the latest token before API calls
      BackendAPI.initialize();
      
      // Check if token exists before making the API call
      const token = localStorage.getItem("quickshift_access_token");
      if (!token) {
        console.error("No authentication token found");
        navigate("/login");
        return;
      }
      
      console.log("Fetching available shifts with token:", token.substring(0, 15) + "...");
      
      try {
        // Fetch available shifts from the backend API        
        const response = await BackendAPI.shiftApi.getAvailableShifts();

        if (response.status === 200 && response.data) {
          console.log("Successfully fetched jobs:", response.data.length);
          // Transform API response data to match our Jobs type
          const apiJobs: Jobs[] = response.data.map((shift: any) => ({
            id: shift.id || '',
            name: shift.title || '',
            company: shift.companyName || '',
            pay: shift.hourlyRate || 0,
            location: shift.location || '',
            skills: shift.requiredSkills || [],
            date: new Date(shift.startTime || Date.now()),
            coords: shift.latitude && shift.longitude ? [shift.latitude, shift.longitude] : undefined,
          }));
          
          setAllJobs(apiJobs);
          // Initial filtering based on current criteria
          filterJobsByRadius(apiJobs);
        } else {
          console.warn("API returned successful but with no data, using fallback data");
          // Fallback to predefined jobs if API fails
          setAllJobs(jobs);
          filterJobsByRadius(jobs);
        }
      } catch (error: any) {
        if (error.response) {
          // The server responded with a status code outside the 2xx range
          console.error("Server error:", error.response.status);
          console.error("Server error details:", error.response.data);
          console.error("Server error headers:", error.response.headers);
          
          if (error.response.status === 500) {
            console.log("Internal server error detected. This is a backend issue, not an authentication problem.");
            console.log("Using fallback job data to allow UI to function.");
            
            // After encountering a 500 error, switch to local data only to prevent further server errors
            setUseLocalDataOnly(true);
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
        } else {
          // Something happened in setting up the request
          console.error("Error message:", error.message);
        }
        
        // Fallback to predefined jobs
        setAllJobs(jobs);
        filterJobsByRadius(jobs);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      // Fallback to predefined jobs
      setAllJobs(jobs);
      filterJobsByRadius(jobs);
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobsByRadius = (jobsList: Jobs[]) => {
    if (userCoords) {
      const nearbyJobs = jobsList.filter((job) =>
        job.coords
          ? getDistanceFromLatLonInMiles(
              userCoords[0],
              userCoords[1],
              job.coords[0],
              job.coords[1]
            ) <= radius
          : includeRemote && job.location.toLowerCase() === "remote"
      );
      setFilteredJobs(nearbyJobs);
    } else {
      setFilteredJobs(
        includeRemote
          ? jobsList.filter(
              (job) => job.location.toLowerCase() === "remote"
            )
          : []
      );
    }
  };

  useEffect(() => {
    filterJobsByRadius(allJobs);
  }, [userCoords, radius, includeRemote]);

  const applyForJob = async (jobId: string) => {
    try {
      await BackendAPI.shiftApi.applyToShift(jobId);
      
      // Show success message
      // ... existing code ...

    } catch (error) {
      console.error("Error applying for job:", error);
      // Show error message
      // ... existing code ...
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar1 />
      <div className="flex flex-grow">
        {/* Left Section (Map) */}
        <div className="w-4/10 p-4">
          <MapContainer
            center={userCoords ?? [37.5, -98.5795]}
            zoom={userCoords ? 9 : 4}
            className="h-full w-full rounded-lg shadow-md"
            maxBounds={[
              [-90, -180],
              [90, 180],
            ]}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* Draw radius around user */}
            {userCoords && (
              <Circle
                center={userCoords}
                radius={radius * 1609.34} // Convert miles to meters
                pathOptions={{ color: "gray", fillOpacity: 0.1 }}
              />
            )}

            {/* Job markers */}
            {filteredJobs
              .filter((job) => job.coords)
              .map((job) => (
                <Marker
                  key={job.id}
                  position={job.coords!}
                  icon={hoveredJobId === job.id ? customIconLarge : customIcon}
                  eventHandlers={{
                    mouseover: () => setHoveredJobId(job.id),
                    mouseout: () => setHoveredJobId(null),
                  }}
                >
                  <Popup>
                    <strong>{job.name}</strong> <br />
                    {job.company} <br />
                    Pay: ${job.pay}/hr <br />
                    {job.location} <br />
                    Skills: {job.skills.join(", ")} <br />
                    <button
                      onClick={() => openJobDetails(job)}
                      className="mt-2 px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800"
                    >
                      View
                    </button>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* Right Section */}
        <div className="w-6/10 flex flex-col">
          <div className="flex-1 p-4">
            <div className="center-dash">
              <h1 className="text-2xl font-bold text-gray-900">
                Recommended Jobs for You
              </h1>
              <p>These jobs are found based on your location and skills.</p>
              <br />
              {filteredJobs.filter((job) => matchesUserSkills(job, userSkills))
                .length > 0 ? (
                <Carousel className="w-full max-w-xs">
                  <CarouselContent>
                    {filteredJobs
                      .filter((job) => matchesUserSkills(job, userSkills))
                      .map((job, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                                <span className="text-3xl font-semibold">
                                  {job.name}
                                </span>
                                <span className="text-xl">{job.location}</span>
                                <span className="text-xl">${job.pay}/hr</span>
                                <br />
                                <span className="text-m">
                                  {job.skills.join(", ")}
                                </span>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              ) : (
                <p className="text-gray-600">
                  {userCoords
                    ? "No jobs found within set miles or skill type."
                    : "Getting your location..."}
                </p>
              )}
            </div>
          </div>

          {/* Radius + Remote Filter + Table */}
          <div className="flex-1 p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label
                  htmlFor="radiusRange"
                  className="block text-sm font-medium text-gray-700"
                >
                  Show jobs within: <strong>{radius} miles</strong>
                </label>
                <Slider
                  id="radiusRange"
                  min={10}
                  max={200}
                  step={10}
                  value={[radius]}
                  onValueChange={(val) => setRadius(val[0])}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="remoteToggle"
                    checked={includeRemote}
                    onCheckedChange={() => setIncludeRemote((prev) => !prev)}
                    className="mr-2"
                  />
                  <label htmlFor="remoteToggle" className="text-sm">
                    Include remote jobs
                  </label>
                </div>
                
                {/* Debug toggle for server issues */}
                <div className="flex items-center">
                  <Checkbox
                    id="localDataToggle"
                    checked={useLocalDataOnly}
                    onCheckedChange={(checked) => {
                      setUseLocalDataOnly(!!checked);
                      fetchJobs(); // Refetch jobs when toggled
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="localDataToggle" className="text-sm">
                    Use local data (offline mode)
                  </label>
                </div>
              </div>
            </div>

            <div className="table-container">
              <center>
                <h1 className="text-2xl font-bold text-gray-900">
                  All Available Jobs
                </h1>
              </center>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Pay</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className={`cursor-pointer transition ${
                        hoveredJobId === job.id ? "bg-gray-100" : ""
                      }`}
                      onMouseEnter={() => setHoveredJobId(job.id)}
                      onMouseLeave={() => setHoveredJobId(null)}
                      onClick={() => openJobDetails(job)}
                    >
                      <TableCell>{job.name}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>${job.pay}/hr</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{job.date.toDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-2">{selectedJob.name}</h2>
            <p className="text-gray-700 mb-1">
              <strong>Company:</strong> {selectedJob.company}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Pay:</strong> ${selectedJob.pay}/hr
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Location:</strong> {selectedJob.location}
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Required Skills:</strong> {selectedJob.skills.join(", ")}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`You have applied the job: ${selectedJob.name}`);
                  closeModal();
                }}
                className="px-4 py-2 rounded bg-black text-white hover:bg-gray-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
