import axios from "axios"
import { apiConnector } from "../services/apiConnector"
import { mediaEndpoints } from "../services/apis"

const { GENERATE_UPLOAD_SIGNATURE_API } = mediaEndpoints

/**
 * Uploads a file directly from the browser to Cloudinary using signed authorization.
 *
 * @param {Object} options
 * @param {File|Blob} options.file - The File or Blob to upload
 * @param {string} options.folderType - Allowed folder type: 'profile' | 'course-thumbnail' | 'course-video' | 'course-note' | 'live-recording' | 'live-chat'
 * @param {string} [options.resourceType='auto'] - Cloudinary resource type: 'image' | 'video' | 'raw' | 'auto'
 * @param {string} options.token - User's JWT authentication token
 * @param {Function} [options.onProgress] - Optional callback for upload percentage (0-100)
 * @returns {Promise<Object>} Cloudinary upload response metadata
 */
export async function uploadToCloudinary({
  file,
  folderType = "profile",
  resourceType = "auto",
  token,
  onProgress,
}) {
  if (!file) {
    throw new Error("No file provided for upload")
  }

  if (!token) {
    throw new Error("Authentication token is required for upload")
  }

  // 1. Request upload signature and parameters from our backend
  const signatureResponse = await apiConnector(
    "POST",
    GENERATE_UPLOAD_SIGNATURE_API,
    {
      folderType,
      resourceType,
    },
    {
      Authorization: `Bearer ${token}`,
    }
  )

  if (!signatureResponse?.data?.success) {
    throw new Error(
      signatureResponse?.data?.message || "Failed to authorize upload"
    )
  }

  const { signature, timestamp, folder, apiKey, cloudName, resourceType: resolvedResourceType } =
    signatureResponse.data.data

  // 2. Build form data for direct Cloudinary upload
  const uploadFormData = new FormData()
  uploadFormData.append("file", file)
  uploadFormData.append("api_key", apiKey)
  uploadFormData.append("timestamp", timestamp)
  uploadFormData.append("signature", signature)
  uploadFormData.append("folder", folder)

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resolvedResourceType || resourceType || "auto"}/upload`

  // 3. Post directly to Cloudinary
  const response = await axios.post(uploadUrl, uploadFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    },
  })

  if (!response?.data?.secure_url) {
    throw new Error("Cloudinary upload did not return a valid secure URL")
  }

  return response.data
}
