import "./Signup.css";
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

export default function Signup() {
  return (
    <>
      <div className="signup-container"></div>
      <div className="center_page">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Get started with QuickShift</CardTitle>
            <CardDescription>
              Signup or signup below to get started.
            </CardDescription>
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
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">Confirm Password</Label>
                  <Input
                    type="password"
                    id="name"
                    placeholder="Your password again"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link to="/login">
              <Button variant="outline">Back to login</Button>
            </Link>
            <Button>Create</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
