"use client";
import { useState } from "react";
import { useForm, SubmitHandler, set } from "react-hook-form";

type Inputs = {
  url: string;
  action: string;
};

export default function Form() {
  const [editAsJson, setEditAsJson] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<null | string>(null);
  const [responseHeaders, setResponseHeaders] = useState<null | string>(null);
  const [responseStatus, setResponseStatus] = useState<null | string>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      url: "https://pokeapi.co/api/v2/pokemon/ditto",
      action: "GET",
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setSubmitting(true);
    console.log(data);
    try {
      const res = await fetch(data.url, {
        method: data.action,
      });
      const json = await res.json();
      console.log(json);
      console.log(res);
      setSubmitting(false);
      setResponse(JSON.stringify(json, null, 2));
      setResponseHeaders(JSON.stringify(res.headers, null, 2));
      setResponseStatus(res.status.toString());
    } catch (error) {
      console.log(error);
      setSubmitting(false);
      setResponse(JSON.stringify(error, null, 2));
      setResponseHeaders(null);
      setResponseStatus(null);
    }
  };

  return (
    <div className="flex flex-col items-start lg:items-center w-full lg:w-1/2 mx-auto p-4  rounded shadow">
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
          <button
            className="button"
            type="button"
            onClick={() => setEditAsJson(!editAsJson)}
          >
            Edit as JSON
          </button>
        </div>
        <button className="btn mb-4 w-full p-2" type="submit">
          <span className={!submitting ? "" : "loading loading-spinner"}></span>
          Go
        </button>
      </form>
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
            className="textarea h-24 textarea-bordered"
            placeholder="Type here"
            value={response ?? ""}
            readOnly
          ></textarea>

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
    </div>
  );
}
