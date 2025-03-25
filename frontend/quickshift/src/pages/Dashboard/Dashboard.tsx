import { Navbar1 } from "../Parts/Topbar/Topbar";
import "./Dashboard.css";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Dashboard() {
  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar1 />
        <div className="flex flex-grow">
          {/* Left Section (30%) */}
          <div className="w-4/10 p-4">Left Section</div>

          {/* Right Section (70%) */}
          <div className="w-6/10 flex flex-col">
            <div className="flex-1 p-4">
              <div className="center-dash">
                <h1 className="text-2xl font-bold text-gray-900">
                  Recommended Jobs for You
                </h1>
                <br />
                <Carousel className="w-full max-w-xs">
                  <CarouselContent>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                              <span className="text-4xl font-semibold">
                                {index + 1}
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
              </div>
            </div>
            <div className="flex-1 bg-gray-400 p-4">Bottom Right</div>
          </div>
        </div>
      </div>
    </>
  );
}
