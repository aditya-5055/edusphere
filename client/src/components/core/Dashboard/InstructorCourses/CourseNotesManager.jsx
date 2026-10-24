import { useEffect, useState } from "react"
import { FiDownload, FiFileText, FiTrash2, FiUploadCloud } from "react-icons/fi"
import { useSelector } from "react-redux"

import {
  fetchCourseNotes,
  getCourseNoteAccessUrl,
  removeCourseNote,
  uploadCourseNote,
} from "../../../../services/operations/courseDetailsAPI"
import { uploadToCloudinary } from "../../../../utils/cloudinaryUpload"
import { toast } from "react-hot-toast"

const formatFileSize = (size) => {
  if (!Number.isFinite(size) || size <= 0) return "Unknown size"

  const units = ["B", "KB", "MB", "GB"]
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / 1024 ** exponent

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`
}

const formatDate = (value) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Date unavailable"

  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function CourseNotesManager({ courseId }) {
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [noteFile, setNoteFile] = useState(null)
  const [previewAsset, setPreviewAsset] = useState(null)
  const [previewTitle, setPreviewTitle] = useState("")
  const [previewType, setPreviewType] = useState("application/pdf")

  const loadNotes = async () => {
    if (!courseId || !token) {
      setLoading(false)
      return
    }

    const response = await fetchCourseNotes(courseId, token)
    setNotes(response)
    setLoading(false)
  }

  useEffect(() => {
    loadNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token])

  const handleUpload = async (event) => {
    event.preventDefault()

    if (!title.trim() || !noteFile) {
      return
    }

    setUploading(true)
    try {
      const uploadRes = await uploadToCloudinary({
        file: noteFile,
        folderType: "course-note",
        resourceType: "raw",
        token,
      })

      const payload = {
        courseId,
        title: title.trim(),
        fileUrl: uploadRes.secure_url,
        filePublicId: uploadRes.public_id,
        fileName: noteFile.name,
        fileType: noteFile.type || "application/pdf",
        fileSize: noteFile.size,
        resourceType: uploadRes.resource_type || "raw",
      }

      const createdNote = await uploadCourseNote(payload, token)

      if (createdNote) {
        setNotes((prev) => [createdNote, ...prev])
        setTitle("")
        setNoteFile(null)
        const input = document.getElementById("course-note-file")
        if (input) input.value = ""
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload note")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (noteId) => {
    setDeletingId(noteId)
    const success = await removeCourseNote({ courseId, noteId }, token)
    if (success) {
      setNotes((prev) => prev.filter((note) => note._id !== noteId))
    }
    setDeletingId(null)
  }

  const openNote = async (note, mode) => {
    const asset = await getCourseNoteAccessUrl(note._id, token, mode)
    if (!asset?.blob) {
      return
    }

    const mimeType = asset.contentType || note.fileType || "application/pdf"
    const previewBlob = new Blob([asset.blob], { type: mimeType })
    const objectUrl = URL.createObjectURL(previewBlob)

    if (mode === "download") {
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = asset.fileName || `note-${noteId}`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      return
    }

    setPreviewAsset(objectUrl)
    setPreviewTitle(note.fileName || asset.fileName || "Course Note Preview")
    setPreviewType(mimeType)
  }

  if (loading) {
    return (
      <div className="mt-6 grid min-h-55 place-items-center rounded-xl border border-richblack-700 bg-richblack-800/40">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-5">
      <form
        onSubmit={handleUpload}
        className="rounded-2xl border border-richblack-700 bg-richblack-800/60 p-5"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-richblack-700 p-2 text-yellow-50">
            <FiUploadCloud size={18} />
          </div>
          <div>
            <p className="text-base font-semibold text-richblack-5">Upload New Note</p>
            <p className="text-xs text-richblack-300">
              Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT (Max 15MB)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            placeholder="Enter note title"
            className="form-style w-full"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            required
          />

          <input
            id="course-note-file"
            type="file"
            className="form-style w-full cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-richblack-700 file:px-3 file:py-1 file:text-sm file:text-richblack-5"
            onChange={(event) => setNoteFile(event.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
            required
          />

          <button
            type="submit"
            disabled={uploading}
            className="yellowButton min-w-40 justify-center"
          >
            {uploading ? "Uploading..." : "Upload Note"}
          </button>
        </div>
      </form>

      <div className="space-y-3 rounded-2xl border border-richblack-700 bg-richblack-800/40 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-richblack-5">Published Notes</h2>
          <span className="rounded-full bg-richblack-700 px-3 py-1 text-xs text-richblack-200">
            {notes.length} Files
          </span>
        </div>

        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-richblack-600 bg-richblack-800/60 p-6 text-center text-sm text-richblack-300">
            No notes uploaded yet.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="flex flex-col gap-3 rounded-xl border border-richblack-700 bg-richblack-900/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-lg bg-richblack-700 p-2 text-yellow-50">
                  <FiFileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-richblack-5">{note.title}</p>
                  <p className="truncate text-xs text-richblack-300">{note.fileName}</p>
                  <p className="mt-1 text-xs text-richblack-400">
                    {formatFileSize(note.fileSize)} • Uploaded {formatDate(note.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    openNote(note, "preview")
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-50"
                >
                  View
                </a>

                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    openNote(note, "download")
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-semibold text-richblack-900"
                >
                  <FiDownload size={15} />
                  Download
                </a>

                <button
                  type="button"
                  disabled={deletingId === note._id}
                  onClick={() => handleDelete(note._id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-pink-200/20 px-3 py-2 text-sm text-pink-50 transition-all hover:bg-pink-200/30"
                >
                  <FiTrash2 size={15} />
                  {deletingId === note._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-richblack-900/90 px-4 py-8 backdrop-blur-sm">
          <div className="flex h-full max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-richblack-700 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-richblack-5">{previewTitle}</p>
                <p className="text-xs text-richblack-300">Previewing note in browser</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(previewAsset)
                  setPreviewAsset(null)
                  setPreviewTitle("")
                }}
                className="rounded-md bg-richblack-700 px-3 py-2 text-sm text-richblack-25"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 bg-richblack-900">
              <object
                data={previewAsset}
                type={previewType}
                className="h-full w-full"
              >
                <div className="grid h-full place-items-center p-6 text-center text-richblack-300">
                  This file cannot be previewed in the browser. Use Download instead.
                </div>
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
