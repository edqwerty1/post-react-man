"use client";
import { useEffect, useState } from "react";
import { type Request } from "./models";

export default function History({
  activeRequestIndex,
  setActiveRequestIndex,
}: {
  activeRequestIndex: number;
  setActiveRequestIndex: (index: number) => void;
}) {
  const [show, setShow] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  useEffect(() => {
    setRequests(
      JSON.parse(window.localStorage.getItem("requests") ?? "[]") || []
    );
  }, [activeRequestIndex]);

  const deleteRequest = (index: number) => {
    // Remove the request at the given index
    const updatedRequests = requests.filter((request, i) => i !== index);
    setRequests(updatedRequests);

    // Update local storage
    window.localStorage.setItem("requests", JSON.stringify(updatedRequests));
  };

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className="p-2 bg-blue-500 text-white mb-2 lg:hidden"
      >
        {show ? "Hide" : "Show"} Requests
      </button>
      <div
        className={`fixed transform transition-transform duration-200 ease-in-out ${
          show ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 top-0 left-0 h-screen w-64 lg:w-1/4  overflow-auto`}
      >
        {requests.map((request: Request, index: number) => (
          <div key={index} className="p-2 border-b">
            <h2 className="font-bold">Request {index + 1}</h2>

            <span className="text-sm font-bold">{request.url}</span>
            <div className="w-full">
              <button
                onClick={() => setActiveRequestIndex(index)}
                className="mt-2 p-2 btn btn-primary btn-sm"
              >
                Load
              </button>
              <button
                onClick={() => deleteRequest(index)}
                className="mt-2 p-2 btn btn-warning ml-2 btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
