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

// Sample user and earnings data
const username = "username HERE";
const earningsData = [
  { week: "Week 1", earnings: 120 },
  { week: "Week 2", earnings: 180 },
  { week: "Week 3", earnings: 250 },
  { week: "Week 4", earnings: 300 },
];

export default function Profile() {
  return (
    <>
      <Navbar1 />
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Profile Section */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{username}</h2>
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
      </div>
    </>
  );
}
