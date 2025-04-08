import { useEffect, useState, useCallback, useRef } from "react";
import { Navbar1 } from "../Parts/Topbar/Topbar";
import "./Dashboard.css";
import markerIcon from "@/assets/marker.png";
import { Circle } from "react-leaflet";
import Swal from "sweetalert2";

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
import { ShiftDto } from "@/backend-api/models";

// Create a custom interface that extends ShiftDto to include the _id property
interface ShiftWithId extends ShiftDto {
  _id: string;
}

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

function matchesUserSkills(shift: ShiftDto, skills: string[]) {
  return shift.tags.some((tag) =>
    skills.some((userSkill) => userSkill.toLowerCase() === tag.toLowerCase())
  );
}

export default function Dashboard() {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [recommendedShifts, setRecommendedShifts] = useState<ShiftWithId[]>([]);
  const [allShifts, setAllShifts] = useState<ShiftWithId[]>([]);
  const [allSkip, setAllSkip] = useState(0);
  const [loadingAll, setLoadingAll] = useState(false);
  const [hasMoreAll, setHasMoreAll] = useState(true);
  const [filteredMapShifts, setFilteredMapShifts] = useState<ShiftWithId[]>([]);
  const [radius, setRadius] = useState(50);
  const [includeRemote, setIncludeRemote] = useState(false);
  const [hoveredShiftId, setHoveredShiftId] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftWithId | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Dynamic loading with pagination and infinite scroll
  const recommendedLimit = 20;
  const allLimit = 10;

  const fetchRecommendedShifts = useCallback(async () => {
    if (!userSkills || userSkills.length === 0) return;
    try {
      const response = await BackendAPI.shiftApi.getAvailableShifts(
        userSkills,
        true,
        0,
        recommendedLimit
      );
      if (response.data && response.data.length > 0) {
        setRecommendedShifts(response.data);
      }
    } catch (err) {
      console.error("Error fetching recommended shifts:", err);
    }
  }, [userSkills]);

  const fetchAllShifts = useCallback(async () => {
    if (loadingAll || !hasMoreAll) return;
    setLoadingAll(true);
    const startTime = Date.now();
    let success = false;
    while (Date.now() - startTime < 20000 && !success) {
      try {
        const response = await BackendAPI.shiftApi.getAvailableShifts(
          undefined,
          undefined,
          allSkip,
          allLimit
        );
        if (response.data && response.data.length > 0) {
          setAllShifts((prev) => [...prev, ...response.data]);
          setAllSkip((prev) => prev + response.data.length);
          if (response.data.length < allLimit) {
            setHasMoreAll(false);
          }
          setError(null);
        } else {
          setHasMoreAll(false);
        }
        success = true;
      } catch (err) {
        console.error("Error fetching all shifts:", err);
        if (Date.now() - startTime < 20000) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
    if (!success) {
      setError("Failed to load available shifts. Please try again later.");
    }
    setLoadingAll(false);
  }, [loadingAll, hasMoreAll, allSkip, allLimit]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch all shifts only after authentication tokens are available
      fetchAllShifts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // When userSkills are available, fetch recommended shifts
    if (userSkills && userSkills.length > 0) {
      fetchRecommendedShifts();
    }
  }, [userSkills]);

  const loaderRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreAll && !loadingAll) {
          fetchAllShifts();
        }
      },
      { threshold: 0.1, rootMargin: "1000px" }
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [fetchAllShifts, hasMoreAll, loadingAll]);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserCoords([position.coords.latitude, position.coords.longitude]);
        },
        (err) => console.error("Error watching position", err)
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (userCoords) {
      const combined = [...recommendedShifts, ...allShifts];
      const nearby = combined.filter((shift) =>
        shift.location
          ? getDistanceFromLatLonInMiles(
              userCoords[0],
              userCoords[1],
              shift.location.latitude,
              shift.location.longitude
            ) <= radius
          : false
      );
      setFilteredMapShifts(nearby);
    } else {
      setFilteredMapShifts([]);
    }
  }, [userCoords, radius, recommendedShifts, allShifts]);

  const openShiftDetails = (shift: ShiftWithId) => {
    setSelectedShift(shift);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedShift(null);
    setShowModal(false);
  };

  // Fetch current user and their skills by polling until successful
  useEffect(() => {
    let isMounted = true;
    const getUser = async () => {
      try {
        const response = await BackendAPI.authApi.getCurrentUser();
        if (response.status === 200 && response.data) {
          if (isMounted) {
            setUserSkills(response.data.skills || []);
            setIsAuthenticated(true);
          }
          return true;
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
      return false;
    };

    // Immediately try fetching the user
    getUser();

    const intervalId = setInterval(async () => {
      const success = await getUser();
      if (success) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Add the following useEffect after the existing useEffect for fetching current user
  useEffect(() => {
    if (!BackendAPI.isAuthenticated) {
      console.log("BackendAPI is not authenticated, refreshing page...");
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }
  }, []);

  // Compute filtered arrays for rendering
  const filteredRecommended = userCoords
    ? recommendedShifts.filter((shift) =>
        shift.location
          ? getDistanceFromLatLonInMiles(
              userCoords[0],
              userCoords[1],
              shift.location.latitude,
              shift.location.longitude
            ) <= radius
          : false
      )
    : recommendedShifts;

  const filteredAll = userCoords
    ? allShifts.filter((shift) =>
        shift.location
          ? getDistanceFromLatLonInMiles(
              userCoords[0],
              userCoords[1],
              shift.location.latitude,
              shift.location.longitude
            ) <= radius
          : false
      )
    : allShifts;

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
            {filteredMapShifts
              .filter((shift) => shift.location)
              .map((shift) => (
                <Marker
                  key={shift._id}
                  position={[shift.location.latitude, shift.location.longitude]}
                  icon={
                    hoveredShiftId === shift._id ? customIconLarge : customIcon
                  }
                  eventHandlers={{
                    mouseover: () => setHoveredShiftId(shift._id),
                    mouseout: () => setHoveredShiftId(null),
                  }}
                >
                  <Popup>
                    <strong>{shift.name}</strong> <br />
                    {shift.companyName} <br />
                    Pay: ${shift.pay}/hr <br />
                    {shift.location.latitude}, {shift.location.longitude} <br />
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
              {loadingAll && recommendedShifts.length === 0 ? (
                <p className="text-gray-600">Loading recommended shifts...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : filteredRecommended.length > 0 ? (
                <Carousel className="w-full max-w-xs">
                  <CarouselContent>
                    {filteredRecommended.map((shift, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => openShiftDetails(shift)}
                          >
                            <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                              <span className="text-3xl font-semibold">
                                {shift.name}
                              </span>
                              <span className="text-xl">
                                {shift.location.latitude},{" "}
                                {shift.location.longitude}
                              </span>
                              <span className="text-xl">${shift.pay}/hr</span>
                              <br />
                              <span className="text-m">
                                {shift.tags.join(", ")}
                              </span>
                              <button className="mt-4 px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800">
                                View Details
                              </button>
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
                    ? "No recommended jobs found within set miles."
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
              {allShifts.length === 0 && loadingAll ? (
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
                      <TableHead>Skills Match</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAll.map((shift) => (
                      <TableRow
                        key={shift._id}
                        className={`cursor-pointer transition ${
                          hoveredShiftId === shift._id ? "bg-gray-100" : ""
                        }`}
                        onMouseEnter={() => setHoveredShiftId(shift._id)}
                        onMouseLeave={() => setHoveredShiftId(null)}
                        onClick={() => openShiftDetails(shift)}
                      >
                        <TableCell>{shift.name}</TableCell>
                        <TableCell>{shift.companyName}</TableCell>
                        <TableCell>${shift.pay}/hr</TableCell>
                        <TableCell>
                          {shift.location.latitude}, {shift.location.longitude}
                        </TableCell>
                        <TableCell>
                          {new Date(shift.startTime).toDateString()}
                        </TableCell>
                        <TableCell>
                          {matchesUserSkills(shift, userSkills) ? (
                            <span className="text-green-600 font-medium">
                              ✓
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div
                ref={loaderRef}
                style={{
                  height: "30px",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                {loadingAll && (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                    <p className="text-sm text-gray-500">
                      Loading more jobs...
                    </p>
                  </div>
                )}
                {!hasMoreAll && (
                  <p className="text-sm text-gray-500">
                    No more jobs available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-2">{selectedShift.name}</h2>
            <p className="text-gray-700 mb-1">
              <strong>Company:</strong> {selectedShift.companyName}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Pay:</strong> ${selectedShift.pay}/hr
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Location:</strong> {selectedShift.location.latitude},{" "}
              {selectedShift.location.longitude}
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Required Skills:</strong> {selectedShift.tags.join(", ")}
            </p>
            {matchesUserSkills(selectedShift, userSkills) && (
              <p className="text-green-600 mb-3">
                <strong>✓ This job matches your skills!</strong>
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  console.log(`shift is ${selectedShift}`);
                  console.log(selectedShift);
                  // Use the BackendAPI's shiftApi to apply for the shift
                  BackendAPI.shiftApi
                    .applyToShift(selectedShift._id)
                    .then(() => {
                      Swal.fire({
                        title: "Success!",
                        text: `You have applied for the job: ${selectedShift.name}`,
                        icon: "success",
                        confirmButtonText: "OK",
                      });
                      closeModal();
                    })
                    .catch((err) => {
                      console.error("Error applying for job:", err);
                      Swal.fire({
                        title: "Error",
                        text: "Failed to apply for the job. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                      });
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
