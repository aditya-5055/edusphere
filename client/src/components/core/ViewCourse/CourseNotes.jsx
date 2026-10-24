import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { FiDownload, FiFileText } from "react-icons/fi"

import {
  fetchCourseNotes,
  getCourseNoteAccessUrl,
} from "../../../services/operations/courseDetailsAPI"

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

export default function CourseNotes() {
  const { token } = useSelector((state) => state.auth)
  const { courseId } = useParams()

  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [previewAsset, setPreviewAsset] = useState(null)
  const [previewTitle, setPreviewTitle] = useState("")
  const [previewType, setPreviewType] = useState("application/pdf")

  useEffect(() => {
    const loadNotes = async () => {
      if (!courseId || !token) {
        setLoading(false)
        return
      }

      setLoading(true)
      const response = await fetchCourseNotes(courseId, token)
      setNotes(response)
      setLoading(false)
    }

    loadNotes()
  }, [courseId, token])

  const noteStats = useMemo(() => {
    const totalSize = notes.reduce((sum, note) => sum + (note.fileSize || 0), 0)
    return {
      count: notes.length,
      totalSize: formatFileSize(totalSize),
    }
  }, [notes])

  const openNote = async (note, mode) => {
    const noteId = note._id
    const asset = await getCourseNoteAccessUrl(noteId, token, mode)
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
      <div className="grid min-h-75 place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl py-8 text-richblack-5">
      <div className="relative overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800/70 p-6">
        <div className="absolute -right-20 -top-16 h-56 w-56 rounded-full bg-yellow-100/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-50/90">
            Course Resources
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Notes Library</h1>
          <p className="text-sm text-richblack-300">
            Download instructor notes anytime while learning in this course.
          </p>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="rounded-xl border border-richblack-700 bg-richblack-900/80 p-3">
            <p className="text-2xl font-semibold text-richblack-5">{noteStats.count}</p>
            <p className="text-xs uppercase tracking-wide text-richblack-300">Files</p>
          </div>
          <div className="rounded-xl border border-richblack-700 bg-richblack-900/80 p-3">
            <p className="text-2xl font-semibold text-richblack-5">{noteStats.totalSize}</p>
            <p className="text-xs uppercase tracking-wide text-richblack-300">Total Size</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-richblack-600 bg-richblack-800/50 p-8 text-center text-richblack-300">
            Notes are not available for this course yet.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="flex flex-col gap-4 rounded-xl border border-richblack-700 bg-richblack-800/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-lg bg-richblack-700 p-2 text-yellow-50">
                  <FiFileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-richblack-5">{note.title}</p>
                  <p className="truncate text-xs text-richblack-300">{note.fileName}</p>
                  <p className="mt-1 text-xs text-richblack-400">
                    {formatFileSize(note.fileSize)} • Added {formatDate(note.createdAt)}
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
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-richblack-700 px-4 py-2 text-sm font-semibold text-richblack-25 transition-all hover:scale-[0.98]"
                >
                  Preview
                </a>

                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    openNote(note, "download")
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 transition-all hover:scale-[0.98]"
                >
                  <FiDownload size={16} />
                  Download
                </a>
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
