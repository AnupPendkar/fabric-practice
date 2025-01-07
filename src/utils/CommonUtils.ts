export function isNullOrUndef(obj: any) {
  return obj === null || obj === undefined;
}

export function getStr(data: any): string {
  return (data as string)?.toString()?.trim();
}

export function getStrLower(data: any): string {
  return getStr(data)?.toLowerCase();
}

export function strCmp(str1: any, str2: any): boolean {
  return getStrLower(str1) === getStrLower(str2);
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0; // Random number between 0 and 15
    const v = c === 'x' ? r : (r & 0x3) | 0x8; // Use 4 for the first "y" and (8, 9, A, or B) for "y"
    return v.toString(16); // Convert to hexadecimal
  });
}

export function cloneDeep<T>(value: T): T {
  // Check if the value is null or not an object (i.e., a primitive)
  if (value === null || typeof value !== "object") {
    return value;
  }

  // If value is an array, create a new array and clone each element
  if (Array.isArray(value)) {
    const arrClone = [] as T & unknown[];
    for (const item of value) {
      arrClone.push(cloneDeep(item));
    }
    return arrClone as T;
  }

  // If value is an object, create a new object and recursively clone each property
  const objClone = {} as T;
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      objClone[key] = cloneDeep(value[key]);
    }
  }

  return objClone;
}

export function isPropEmpty(val: any): boolean {
  return (
    isNullOrUndef(val) ||
    (typeof val === "number" && val < 0) ||
    (typeof val === "string" && !val?.trim()?.length) ||
    (Array.isArray(val) && !val?.filter(Boolean)?.length) ||
    (typeof val === "object" && Object.keys(val).length === 0) ||
    (typeof val === "boolean" && val !== true)
  );
}

export function getAttrDispName(attrName: string): string {
  return attrName?.split("_").join(" ");
}

export function removeHttpUrl(url: string) {
  if (isPropEmpty(url)) {
    return url;
  }

  const urlParts = url.split("/media/");
  if (urlParts.length > 1) {
    return "/media/" + urlParts[1];
  }
  return url;
}

export function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp * 1000); // Convert to milliseconds

  const hours = String(date.getHours()).padStart(2, "0"); // Local hours
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Local minutes
  const seconds = String(date.getSeconds()).padStart(2, "0"); // Local seconds

  const day = String(date.getDate()).padStart(2, "0"); // Local day
  const month = date.toLocaleString("default", { month: "short" }); // Local month
  const year = date.getFullYear(); // Local year

  return `${hours}:${minutes}:${seconds}  ${day}-${month}-${year}`;
}