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
import { useEffect, useState } from "react";
import { BackendAPI, ACCESS_TOKEN_KEY } from "@/lib/backend/backend-api";
import { useNavigate } from "react-router-dom";

// Sample earnings data (would come from API in real implementation)
const mockEarningsData = [
  { week: "Week 1", earnings: 120 },
  { week: "Week 2", earnings: 180 },
  { week: "Week 3", earnings: 250 },
  { week: "Week 4", earnings: 300 },
];

type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [earningsData, setEarningsData] = useState(mockEarningsData);

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
        
        // Fetch user profile
        fetchUserProfile();
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuthentication();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Ensure the API is using the latest token
      BackendAPI.initialize();
      
      // Fetch the user profile data from the backend
      // Since we don't have a specific user profile endpoint in our API,
      // we need to get creative and use the available endpoints
      
      // We'll make a direct API call to a "me" endpoint if it exists,
      // or use a workaround based on available API methods

      // First, check if user is authenticated by the presence of a token
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // For this example, we'll simulate getting profile data
      // In a real implementation, you would call an appropriate API endpoint
      // Such as: const response = await BackendAPI.userApi.getProfile();
      
      // We could potentially parse claims from the JWT token
      if (token) {
        try {
          // This is a basic way to extract user info from a JWT token
          // Note: In production, you'd want this info from a secure API call
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            setProfile({
              username: payload.sub || 'Anonymous',
              firstName: payload.given_name || 'User',
              lastName: payload.family_name || '',
              email: payload.email || 'No email available'
            });
          } else {
            throw new Error("Invalid token format");
          }
        } catch (err) {
          console.error("Error parsing token:", err);
          // Fallback to default profile
          setProfile({
            username: "user",
            firstName: "Anonymous",
            lastName: "User",
            email: "Anonymous user"
          });
        }
      }
      
      // For earnings data, we would need an API endpoint
      // In a real app, you would use something like:
      // const earningsResponse = await BackendAPI.paymentApi.getEarnings();
      // setEarningsData(earningsResponse.data);
      
      // For now, we'll use the mock data
      setEarningsData(mockEarningsData);
      
    } catch (error) {
      console.error("Failed to load profile:", error);
      // Set a default profile if unable to get the actual profile
      setProfile({
        username: "user",
        firstName: "Anonymous",
        lastName: "User",
        email: "Anonymous user"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    BackendAPI.logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <>
        <Navbar1 />
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar1 />
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Profile Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
              {profile?.firstName.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{profile?.username || 'Username'}</h2>
              <p className="text-gray-500">
                {`${profile?.firstName || ''} ${profile?.lastName || ''}`}
              </p>
              <p className="text-gray-500">{profile?.email || 'Email'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Logout
          </button>
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
