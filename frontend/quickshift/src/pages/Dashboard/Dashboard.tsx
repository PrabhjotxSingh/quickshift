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
import { BackendAPI } from "@/lib/backend/backend-api";

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

// Define the Shift interface based on the API response
interface Shift {
  id: string;
  title: string;
  employer: string;
  rate: number;
  location: string;
  tags: string[];
  startTime: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const userSkills = ["driving"];

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

function matchesUserSkills(shift: Shift, skills: string[]) {
  return shift.tags.some((tag) =>
    skills.some((userSkill) => userSkill.toLowerCase() === tag.toLowerCase())
  );
}

export default function Dashboard() {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [radius, setRadius] = useState(50);
  const [includeRemote, setIncludeRemote] = useState(false);
  const [hoveredShiftId, setHoveredShiftId] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openShiftDetails = (shift: Shift) => {
    setSelectedShift(shift);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedShift(null);
    setShowModal(false);
  };

  // Fetch available shifts from the API
  useEffect(() => {
    const fetchAvailableShifts = async () => {
      try {
        setLoading(true);
        // Use BackendAPI's shiftApi instead of directly instantiating ShiftApi
        console.log(`Authenticated is ${BackendAPI.isAuthenticated}`);
        const response = await BackendAPI.shiftApi.getAvailableShifts();

        // The API response should already match our Shift interface
        setShifts(response.data);
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
      const nearbyShifts = shifts.filter((shift) =>
        shift.coordinates
          ? getDistanceFromLatLonInMiles(
              userCoords[0],
              userCoords[1],
              shift.coordinates.lat,
              shift.coordinates.lng
            ) <= radius
          : includeRemote && shift.location.toLowerCase() === "remote"
      );
      setFilteredShifts(nearbyShifts);
    } else {
      setFilteredShifts(
        includeRemote
          ? shifts.filter((shift) => shift.location.toLowerCase() === "remote")
          : []
      );
    }
  }, [userCoords, radius, includeRemote, shifts]);

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

            {/* Shift markers */}
            {filteredShifts
              .filter((shift) => shift.coordinates)
              .map((shift) => (
                <Marker
                  key={shift.id}
                  position={[shift.coordinates!.lat, shift.coordinates!.lng]}
                  icon={
                    hoveredShiftId === shift.id ? customIconLarge : customIcon
                  }
                  eventHandlers={{
                    mouseover: () => setHoveredShiftId(shift.id),
                    mouseout: () => setHoveredShiftId(null),
                  }}
                >
                  <Popup>
                    <strong>{shift.title}</strong> <br />
                    {shift.employer} <br />
                    Pay: ${shift.rate}/hr <br />
                    {shift.location} <br />
                    Skills: {shift.tags.join(", ")} <br />
                    <button
                      onClick={() => openShiftDetails(shift)}
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
              ) : filteredShifts.filter((shift) =>
                  matchesUserSkills(shift, userSkills)
                ).length > 0 ? (
                <Carousel className="w-full max-w-xs">
                  <CarouselContent>
                    {filteredShifts
                      .filter((shift) => matchesUserSkills(shift, userSkills))
                      .map((shift, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                                <span className="text-3xl font-semibold">
                                  {shift.title}
                                </span>
                                <span className="text-xl">
                                  {shift.location}
                                </span>
                                <span className="text-xl">
                                  ${shift.rate}/hr
                                </span>
                                <br />
                                <span className="text-m">
                                  {shift.tags.join(", ")}
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
                    {filteredShifts.map((shift) => (
                      <TableRow
                        key={shift.id}
                        className={`cursor-pointer transition ${
                          hoveredShiftId === shift.id ? "bg-gray-100" : ""
                        }`}
                        onMouseEnter={() => setHoveredShiftId(shift.id)}
                        onMouseLeave={() => setHoveredShiftId(null)}
                        onClick={() => openShiftDetails(shift)}
                      >
                        <TableCell>{shift.title}</TableCell>
                        <TableCell>{shift.employer}</TableCell>
                        <TableCell>${shift.rate}/hr</TableCell>
                        <TableCell>{shift.location}</TableCell>
                        <TableCell>
                          {new Date(shift.startTime).toDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-2">{selectedShift.title}</h2>
            <p className="text-gray-700 mb-1">
              <strong>Company:</strong> {selectedShift.employer}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Pay:</strong> ${selectedShift.rate}/hr
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Location:</strong> {selectedShift.location}
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Required Skills:</strong> {selectedShift.tags.join(", ")}
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
                  // Use the BackendAPI's shiftApi to apply for the shift
                  BackendAPI.shiftApi
                    .applyToShift(selectedShift.id)
                    .then(() => {
                      alert(
                        `You have applied for the job: ${selectedShift.title}`
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
