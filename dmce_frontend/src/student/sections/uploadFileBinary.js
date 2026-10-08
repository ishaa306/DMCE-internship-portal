export const uploadFileBinary = async (file, type) => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch(`https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/upload/${type}`, {
    method: 'POST',
    credentials: 'include',
    body: arrayBuffer,
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': file.name,
      'X-File-Type': file.type
    }
  });
  if (!response.ok) {
    let error = 'Unknown error';
    try {
      const errorResult = await response.json();
      error = errorResult.error || errorResult.details || error;
    } catch { }
    throw new Error(error);
  }
  const result = await response.json();
  return result.url;
};