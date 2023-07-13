"use client";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, set, useFieldArray } from "react-hook-form";
import { type Request } from "./models";

export default function Form({
  activeRequestIndex,
  setActiveRequestIndex,
}: {
  activeRequestIndex: number;
  setActiveRequestIndex: (index: number) => void;
}) {
  const [editAsJson, setEditAsJson] = useState(false);
  const [formDataAsJson, setFormDataAsJson] = useState<null | string>(null);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<null | string>(null);
  const [responseHeaders, setResponseHeaders] = useState<null | string>(null);
  const [responseStatus, setResponseStatus] = useState<null | string>(null);
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
    try {
      const res = await fetch(data.url, {
        method: data.action,
        headers: Object.fromEntries(
          data.headers.map((header) => [header.key, header.value])
        ),
      });
      const json = await res.json();
      console.log(json);
      console.log(res);
      setSubmitting(false);
      setResponse(JSON.stringify(json, null, 2));
      setResponseHeaders(JSON.stringify(res.headers, null, 2));
      setResponseStatus(res.status.toString());

      const existingRequests =
        JSON.parse(window.localStorage.getItem("requests") ?? "[]") || [];
      existingRequests.push(data);
      window.localStorage.setItem("requests", JSON.stringify(existingRequests));
      setActiveRequestIndex(existingRequests.length - 1);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
      setResponse(JSON.stringify(error, null, 2));
      setResponseHeaders(null);
      setResponseStatus(null);
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
                className="w-full p-2 border border-gray-300 rounded mb-2 lg:mb-0"
              />
              <input
                {...register(`headers[${index}].value` as any, {
                  required: true,
                })}
                defaultValue={header.value}
                placeholder="Value"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="self-start lg:self-center p-2 text-white bg-red-500 hover:bg-red-700 rounded"
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="w-full p-2 text-white bg-green-500 hover:bg-green-700 rounded mb-4"
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
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Response Status</span>
          </label>
          {responseStatus && (
            <span className="transition-opacity">{responseStatus ?? ""}</span>
          )}
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Response</span>
          </label>
          <textarea
            className="textarea h-52 textarea-bordered"
            placeholder="Type here"
            value={response ?? ""}
            readOnly
          ></textarea>
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Response Headers</span>
          </label>
          <textarea
            className="textarea h-24 textarea-bordered textarea-lg"
            placeholder="Type here"
            value={responseHeaders ?? ""}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
}
