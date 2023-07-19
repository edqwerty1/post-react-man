"use client";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, set, useFieldArray } from "react-hook-form";
import { type Request } from "./models";
import { getReasonPhrase } from "http-status-codes";

type Response = {
  status: number;
  headers: Headers;
  body: string;
  time: number;
  size: string;
  cookies: string;
  statusText: string;
};

function formatFileSize(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const decimalDigits = 2;

  if (bytes === 0) {
    return "0 Bytes";
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = parseFloat(
    (bytes / Math.pow(1024, i)).toFixed(decimalDigits)
  );

  return `${formattedSize} ${sizes[i]}`;
}

export default function Form({
  activeRequestIndex,
  setActiveRequestIndex,
}: {
  activeRequestIndex: number;
  setActiveRequestIndex: (index: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<"data" | "headers">("data");
  const [editAsJson, setEditAsJson] = useState(false);
  const [formDataAsJson, setFormDataAsJson] = useState<null | string>(null);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<null | Response>(null);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Request>({
    defaultValues: {
      url: "https://pokeapi.co/api/v2/pokemon/ditto",
      action: "GET",
      headers: [
        {
          key: "Content-Type",
          value: "application/json",
        },
      ],
    },
  });
  const onSubmit: SubmitHandler<Request> = async (data) => {
    setSubmitting(true);
    console.log(data);
    const startTime = performance.now();
    try {
      const res = await fetch(data.url, {
        method: data.action,
        headers: Object.fromEntries(
          data.headers.map((header) => [header.key, header.value])
        ),
      });
      const endTime = performance.now();
      const requestTime = endTime - startTime;
      // Get the response size in kilobytes
      const contentLength = res.headers.get("content-length") ?? "0";

      const json = await res.json();
      console.log(json);
      console.log(res);
      setSubmitting(false);
      setResponse({
        status: res.status,
        headers: res.headers,
        body: JSON.stringify(json, null, 2),
        time: requestTime,
        size: formatFileSize(parseInt(contentLength, 10)),
        cookies: res.headers.get("set-cookie") ?? "",
        statusText: getReasonPhrase(res.status),
      });

      const existingRequests =
        JSON.parse(window.localStorage.getItem("requests") ?? "[]") || [];
      if (
        existingRequests &&
        existingRequests.length > 0 &&
        JSON.stringify(existingRequests[existingRequests.length - 1]) ===
          JSON.stringify(data)
      ) {
        return;
      }
      existingRequests.push(data);
      window.localStorage.setItem("requests", JSON.stringify(existingRequests));
      setActiveRequestIndex(existingRequests.length - 1);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
      setResponse(null);
    }
  };

  const loadRequest = (index: number) => {
    const existingRequests =
      JSON.parse(window.localStorage.getItem("requests") ?? "[]") || [];
    const data = existingRequests[index];
    if (data) {
      reset(data);
    }
  };

  // Example usage: Load the first request on component mount
  useEffect(() => {
    loadRequest(activeRequestIndex);
  }, [activeRequestIndex]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "headers",
  });

  return (
    <div className="flex flex-col items-start lg:items-center w-full lg:w-1/2 mx-auto p-4  rounded shadow">
      <div className="prose  w-full">
        <h2>Request</h2>
      </div>
      <button
        className="button"
        type="button"
        onClick={() => {
          setEditAsJson(!editAsJson);
          setFormDataAsJson(JSON.stringify(getValues(), null, 2));
        }}
      >
        Edit as JSON
      </button>
      {editAsJson && (
        <>
          <div className="form-control mb-4 w-full">
            <label className="label">
              <span className="label-text">JSON</span>
            </label>
            <textarea
              className="textarea h-24 textarea-bordered h-52"
              placeholder="Type here"
              value={formDataAsJson ?? ""}
              onChange={(e) => {
                setFormDataAsJson(e.target.value);
              }}
            ></textarea>
          </div>
          <button
            className="btn mb-4 w-full p-2 btn-primary"
            type="submit"
            onClick={() => {
              setEditAsJson(false);
              reset(formDataAsJson ? JSON.parse(formDataAsJson) : {});
            }}
          >
            Save
          </button>
        </>
      )}
      {!editAsJson && (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Url</span>
            </label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered"
              defaultValue="https://pokeapi.co/api/v2/pokemon/ditto"
              {...register("url")}
            />
          </div>
          <div className="join mb-4">
            <input
              className="join-item btn"
              type="radio"
              aria-label="GET"
              value="GET"
              {...register("action")}
            />
            <input
              className="join-item btn"
              type="radio"
              aria-label="POST"
              value="POST"
              {...register("action")}
            />
            <input
              className="join-item btn"
              type="radio"
              aria-label="PUT"
              value="PUT"
              {...register("action")}
            />
            <input
              className="join-item btn"
              type="radio"
              aria-label="DELETE"
              value="DELETE"
              {...register("action")}
            />
            <input
              className="join-item btn"
              type="radio"
              aria-label="OPTIONS"
              value="OPTIONS"
              {...register("action")}
            />
            <input
              className="join-item btn"
              type="radio"
              aria-label="PATCH"
              value="PATCH"
              {...register("action")}
            />
          </div>
          {fields.map((header, index) => (
            <div
              key={header.id}
              className="mb-4 lg:flex lg:items-center lg:space-x-4"
            >
              <input
                {...register(`headers[${index}].key` as any, {
                  required: true,
                })}
                defaultValue={header.key}
                placeholder="Key"
                className="w-full p-2 input input-bordered mb-2 lg:mb-0"
              />
              <input
                {...register(`headers[${index}].value` as any, {
                  required: true,
                })}
                defaultValue={header.value}
                placeholder="Value"
                className="w-full p-2 input input-bordered"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="self-start lg:self-center p-2 btn btn-error btn-square btn-outline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="w-full p-2 btn btn-accent mb-4"
          >
            Add New Header
          </button>
          <button className="btn mb-4 w-full p-2 btn-primary" type="submit">
            <span
              className={!submitting ? "" : "loading loading-spinner"}
            ></span>
            Go
          </button>
        </form>
      )}
      <div className="w-full">
        <div className="divider"></div>
        <div className="prose ">
          <h2>Response</h2>
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Status:</span>
            <label className="swap  swap-active text-right">
              <div
                className={
                  !response?.status && !submitting ? "swap-on" : "swap-off"
                }
              >
                Pending...
              </div>
              <div className={submitting ? "swap-on" : "swap-off"}>
                <span className="loading loading-ring loading-xs"></span>
              </div>
              <div
                className={
                  response?.status && !submitting
                    ? "swap-on font-bold"
                    : "swap-off"
                }
              >
                {response?.status} - {response?.statusText} -{" "}
                {Math.floor(response?.time ?? 0)} ms{" "}
              </div>
            </label>
          </label>
        </div>
        <div className="w-full tabs">
          <a
            className={
              activeTab === "data"
                ? "tab tab-bordered tab-active"
                : "tab tab-bordered"
            }
            onClick={() => setActiveTab("data")}
          >
            Data
          </a>
          <a
            className={
              activeTab === "headers"
                ? "tab tab-bordered tab-active"
                : "tab tab-bordered"
            }
            onClick={() => setActiveTab("headers")}
          >
            Headers
          </a>
        </div>
        {activeTab === "data" && (
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Response Data</span>
            </label>
            <textarea
              className="textarea h-52 textarea-bordered"
              placeholder="Waiting for response..."
              value={response?.body ?? ""}
              readOnly
            ></textarea>
          </div>
        )}
        {activeTab === "headers" && (
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Response Headers</span>
            </label>
            {Array.from(response?.headers.entries() ?? []).map(
              ([key, value]) => (
                <div key={key} className="flex flex-row">
                  <div className="w-1/2">{key}</div>
                  <div className="w-1/2">{value}</div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
