import "./Login.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <>
      <div className="login-container"></div>
      <div className="center_page">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Welcome to QuickShift</CardTitle>
            <CardDescription>Login below to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Email</Label>
                  <Input id="name" placeholder="Your email address" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">Password</Label>
                  <Input
                    type="password"
                    id="name"
                    placeholder="Your password"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link to="/signup">
              <Button variant="outline">Signup</Button>
            </Link>
            <Button>Login</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
