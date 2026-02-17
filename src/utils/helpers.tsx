/* eslint-disable @typescript-eslint/no-explicit-any */
export const currentDate = (): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(new Date())
}

export const extractErrorMessage = (error: any): string => {
  const response = error?.response?.data;
  if (response?.errors && typeof response.errors === "object") {
    return Object.values(response.errors)
      .flat()
      .filter(Boolean)
      .join("\n");
  }
  if (Array.isArray(response?.message)) {
    return response.message.join("\n");
  }
  if (typeof response?.message === "string") {
    return response.message;
  }
  if (typeof response === "string") {
    return response;
  }
  return error?.message || "Submission failed!";
};
