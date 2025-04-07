import { useEffect, useState } from "react";
import { Navbar1 } from "../Parts/Topbar/Topbar";
import "./Dashboard.css";
import markerIcon from "@/assets/marker.png";
import { Circle } from "react-leaflet";

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
import { ShiftApi } from "@/backend-api/api/shift-api";

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

type Job = {
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

// Initialize the ShiftApi
const shiftApi = new ShiftApi();

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

function matchesUserSkills(job: Job, skills: string[]) {
  return job.skills.some((skill) =>
    skills.some((userSkill) => userSkill.toLowerCase() === skill.toLowerCase())
  );
}

export default function Dashboard() {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [radius, setRadius] = useState(50);
  const [includeRemote, setIncludeRemote] = useState(false);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setShowModal(false);
  };

  // Fetch available shifts from the API
  useEffect(() => {
    const fetchAvailableShifts = async () => {
      try {
        setLoading(true);
        const response = await shiftApi.getAvailableShifts();

        // Transform API response to match our Job type
        // This transformation will depend on the actual structure of the API response
        const transformedJobs: Job[] = response.data.map((shift: any) => ({
          id: shift.id,
          name: shift.title || shift.name,
          company: shift.company || shift.employer,
          pay: shift.pay || shift.rate,
          location: shift.location,
          skills: shift.skills || shift.tags || [],
          date: new Date(shift.date || shift.startTime),
          coords:
            shift.coordinates || shift.location
              ? [
                  parseFloat(shift.coordinates.lat || shift.location.lat),
                  parseFloat(shift.coordinates.lng || shift.location.lng),
                ]
              : undefined,
        }));

        setJobs(transformedJobs);
        setError(null);
      } catch (err) {
        console.error("Error fetching available shifts:", err);
        setError("Failed to load available shifts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableShifts();
  }, []);

  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords([position.coords.latitude, position.coords.longitude]);
      },
      (err) => console.error("Failed to get user location:", err)
    );
  }, []);

  useEffect(() => {
    if (userCoords) {
      const nearbyJobs = jobs.filter((job) =>
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
          ? jobs.filter((job) => job.location.toLowerCase() === "remote")
          : []
      );
    }
  }, [userCoords, radius, includeRemote, jobs]);

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
              {loading ? (
                <p className="text-gray-600">Loading available shifts...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : filteredJobs.filter((job) =>
                  matchesUserSkills(job, userSkills)
                ).length > 0 ? (
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
            </div>

            <div className="table-container">
              <center>
                <h1 className="text-2xl font-bold text-gray-900">
                  All Available Jobs
                </h1>
              </center>
              {loading ? (
                <p className="text-center py-4">Loading available shifts...</p>
              ) : error ? (
                <p className="text-center py-4 text-red-600">{error}</p>
              ) : (
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
              )}
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
                  // Use the ShiftApi to apply for the job
                  shiftApi
                    .applyToShift(selectedJob.id)
                    .then(() => {
                      alert(
                        `You have applied for the job: ${selectedJob.name}`
                      );
                      closeModal();
                    })
                    .catch((err) => {
                      console.error("Error applying for job:", err);
                      alert("Failed to apply for the job. Please try again.");
                    });
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
