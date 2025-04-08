import { Navbar1 } from "../Parts/Topbar/Topbar";
import "./Profile.css";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Input } from "@/components/ui/input";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { BackendAPI } from "@/lib/backend/backend-api";
import Swal from "sweetalert2";

export default function Profile() {
  const [skills, setSkills] = useState("");
  const [userData, setUserData] = useState<{
    username: string;
    skills: string[];
  }>({ username: "", skills: [] });
  const [earningsData, setEarningsData] = useState<
    { week: string; earnings: number }[]
  >([]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await BackendAPI.authApi.getCurrentUser();
        if (response.data) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    }
    fetchUserData();
    async function fetchEarningsData() {
      try {
        const response = await BackendAPI.shiftApi.getUserEarnings();
        if (response.data) {
          console.log(response.data);
          setEarningsData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch earnings data", error);
      }
    }
    fetchEarningsData();
  }, []);

  const handleSkillsSubmit = async () => {
    const skillsArray = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    try {
      const response = await BackendAPI.authApi.addSkills(skillsArray);
      if (response.data) {
        setUserData(response.data);
        Swal.fire("Success", "Skills updated successfully", "success");
        setSkills("");
      } else {
        Swal.fire("Error", "Failed to update skills", "error");
      }
    } catch (error) {
      console.error("Error updating skills", error);
      Swal.fire("Error", "Failed to update skills", "error");
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    try {
      const response = await BackendAPI.authApi.deleteSkills([skillToRemove]);
      if (response.data) {
        setUserData(response.data);
        Swal.fire("Success", "Skill removed successfully", "success");
      } else {
        Swal.fire("Error", "Failed to remove skill", "error");
      }
    } catch (error) {
      console.error("Error removing skill", error);
      Swal.fire("Error", "Failed to remove skill", "error");
    }
  };

  return (
    <>
      <Navbar1 />
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Profile Section */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
            {userData.username ? userData.username.charAt(0).toUpperCase() : ""}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {userData.username || "User"}
            </h2>
            <p className="text-gray-500">User Profile</p>
          </div>
        </div>

        {/* Earnings Graph */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Earnings Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#000"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skills Input */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Enter your skills</h3>
          <p className="text-sm text-gray-500">Use commas to separate skills</p>
          <Input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g., driving, cleaning, software"
          />
          <Button onClick={handleSkillsSubmit}>Submit</Button>
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Your Skills</h4>
            {userData.skills && userData.skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {userData.skills.map((skill, index) => (
                  <li key={index} className="relative group">
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="px-3 py-1 bg-gray-200 rounded-full transition-colors duration-300 group-hover:bg-red-500 group-hover:text-white cursor-pointer"
                    >
                      <span>{skill}</span>
                      <span className="ml-2 text-red-500 group-hover:text-white">
                        X
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No skills added.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
