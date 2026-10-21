import type { Config, Context } from "@netlify/functions";
import axios from "axios";
import type { AxiosResponse, AxiosPromise, AxiosError, AxiosRequestConfig } from "axios";

// https://stackoverflow.com/a/71534399

const maximumSizes = 20 * 1024 * 1024;

function copyHeader(headerName: string, to: Headers, from: Headers) {
  const hdrVal = from.get(headerName);
  if (hdrVal) {
    to.set(headerName, hdrVal);
  }
}

const DefaultCORSHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-goog-visitor-id, x-goog-api-key, x-origin, x-youtube-client-version, x-youtube-client-name, x-goog-api-format-version, x-user-agent, Accept-Language, Range, Referer',
  //'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Methods': 'GET, OPTIONS, PUT, POST, DELETE, HEAD',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true'
};
function generateHeaders(headers: Record<string, string> | undefined): Record<string, string> {
  // return { ...DefaultCORSHeaders, ...headers };
  if (headers == undefined) return DefaultCORSHeaders;
  return { ...DefaultCORSHeaders, ...headers };
}

function getDefaultResponse(): Response {
  return new Response("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890", { status: 200, headers: generateHeaders({ "Content-Type": "text/plain" }));
}

export default async (req: Request, ctx: Context) => {

  let url: URL | undefined;
  try {
    url = new URL(req.url);
  } catch (err) {
    return new Response("Serverside error occurred", {status: 400, headers: generateHeaders({"Content-Type":"text/plain"})});
  }

  let searchParams: URLSearchParams | undefined = url.searchParams;
  if (searchParams == undefined) return getDefaultResponse();

  if (!searchParams.has("__h1")) return getDefaultResponse(); // __host
  if (!searchParams.has("__p1")) return getDefaultResponse(); // __port
  if (!searchParams.has("__p2")) return getDefaultResponse(); // __protocol

  let chosenURL = new URL(req.url);
  
  chosenURL.host = searchParams.get("__h1");
  chosenURL.protocol = searchParams.get("__p2");
  // chosenURL.port = parseInt(offsetStringBackwards(searchParams.get("__p1")));
  chosenURL.port = searchParams.get("__p1");
  chosenURL.searchParams.delete("__h1");
  chosenURL.searchParams.delete("__p1");
  chosenURL.searchParams.delete("__p2");

  let reqHeaders = new Headers(JSON.parse(url.searchParams.get("__h2") || "{}"));
  copyHeader('range', reqHeaders, req.headers);

  if (!reqHeaders.has('user-agent')) {
    copyHeader('user-agent', reqHeaders, req.headers);
  }

  chosenURL.searchParams.delete("__h2"); // headers

  
  
  

  let res: AxiosResponse | undefined;
  try {
    let newBody: any | undefined = undefined;
    if (req.method == 'POST' || req.method == 'PUT') {
      newBody = req.body;
    }
    // res = await axios.get<any>(chosenURL, {
    // res = await axios<any>(chosenURL, {
    res = await axios.request<any>({
      url: chosenURL,
      headers: reqHeaders,
      timeout: 60000,
      responseType: "stream",
      maxContentLength: maximumSizes,
      maxBodyLength: maximumSizes,
      decompress: false,
      withCredentials: true,
      // data: req.body,
      data: newBody,
      method: req.method,
    });
  } catch (err) {
    return getDefaultResponse();
  }

  let returnHeaders = new Headers();
  let firingHandler = {};
  let queue = [];
  /*res.on('data', (newData) => {
    
  });*/
  console.log("Headers:");
  console.log(res.headers);
  let hasSeen1 = false;
  res.on('data', (newData) => {
    if (hasSeen1 == false) {
      hasSeen1 = true;
      console.log("Headers:");
      console.log(res.headers);
      return getDefaultResponse();
    }
  });
  

  
  
};

export const config: Config = {
  // method: "GET",
  path: "api/random/func1",
};
