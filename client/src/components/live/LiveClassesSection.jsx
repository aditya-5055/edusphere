import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

import ConfirmationModal from "../Common/ConfirmationModal"
import { apiConnector } from "../../services/apiConnector"

const getLiveLectureApiBase = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL

  if (!baseUrl) {
    return "/api/live-lectures"
  }

  try {
    const parsed = new URL(baseUrl)
    let path = parsed.pathname.replace(/\/+$/, "")

    if (path.endsWith("/v1")) {
      path = path.slice(0, -3)
    }

    return `${parsed.origin}${path}/live-lectures`
  } catch {
    const normalized = baseUrl.replace(/\/+$/, "")
    if (normalized.endsWith("/v1")) {
      return `${normalized.slice(0, -3)}/live-lectures`
    }
    return `${normalized}/live-lectures`
  }
}

const toMediaUrl = (recordingUrl) => {
  if (!recordingUrl) return null

  if (recordingUrl.startsWith("http://") || recordingUrl.startsWith("https://")) {
    return recordingUrl
  }

  const baseUrl = import.meta.env.VITE_BASE_URL
  if (!baseUrl) return recordingUrl

  try {
    const parsed = new URL(baseUrl)
    return `${parsed.origin}${recordingUrl}`
  } catch {
    return recordingUrl
  }
}

const formatDateTime = (value) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const getStatusStyles = (status) => {
  if (status === "live") return "bg-green-200/20 text-green-25 border-green-200/40"
  if (status === "ended") return "bg-blue-200/20 text-blue-25 border-blue-200/40"
  if (status === "cancelled") return "bg-pink-200/20 text-pink-100 border-pink-200/40"
  return "bg-yellow-100/20 text-yellow-25 border-yellow-100/40"
}

export default function LiveClassesSection({ courseId, isInstructorView = false }) {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  const [title, setTitle] = useState("")
  const [sectionName, setSectionName] = useState("")
  const [lectureDescription, setLectureDescription] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)

  const activeLectures = useMemo(
    () => lectures.filter((lecture) => ["scheduled", "live"].includes(lecture.status)),
    [lectures]
  )

  const historyLectures = useMemo(
    () =>
      lectures
        .filter((lecture) => ["ended", "cancelled"].includes(lecture.status))
        .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)),
    [lectures]
  )

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : null),
    [token]
  )

  const fetchLectures = async (showLoader = true) => {
    if (!courseId || !token) return

    try {
      if (showLoader) {
        setLoading(true)
      }
      const response = await apiConnector(
        "GET",
        `${getLiveLectureApiBase()}/course/${courseId}`,
        null,
        headers
      )

      setLectures(response?.data?.data || [])
    } catch {
      setLectures([])
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchLectures()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token])

  useEffect(() => {
    if (!courseId || !token || isInstructorView) return

    const intervalId = window.setInterval(() => {
      fetchLectures(false)
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token, isInstructorView])

  const handleSchedule = async (event) => {
    event.preventDefault()

    if (!title.trim() || !sectionName.trim() || !scheduledAt) {
      toast.error("Please enter section, title and schedule date/time")
      return
    }

    try {
      setSubmitting(true)
      await apiConnector(
        "POST",
        `${getLiveLectureApiBase()}/schedule`,
        {
          courseId,
          sectionName: sectionName.trim(),
          title: title.trim(),
          lectureDescription: lectureDescription.trim(),
          scheduledAt,
        },
        headers
      )

      toast.success("Live class scheduled")
      setTitle("")
      setSectionName("")
      setLectureDescription("")
      setScheduledAt("")
      await fetchLectures()
    } catch {
      toast.error("Could not schedule class")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartClass = async (lecture) => {
    try {
      await apiConnector(
        "PATCH",
        `${getLiveLectureApiBase()}/${lecture._id}/start`,
        null,
        headers
      )
      navigate(`/live/instructor/${lecture.roomId}?lectureId=${lecture._id}`)
    } catch {
      toast.error("Could not start class")
    }
  }

  const handleCancelClass = async (lectureId) => {
    try {
      await apiConnector(
        "PATCH",
        `${getLiveLectureApiBase()}/${lectureId}/cancel`,
        null,
        headers
      )
      toast.success("Class cancelled")
      await fetchLectures()
    } catch {
      toast.error("Could not cancel class")
    }
  }

  if (!token) {
    return null
  }

  return (
    <div className="my-8 rounded-xl border border-richblack-700 bg-richblack-800/30 p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-2xl font-semibold text-richblack-5">Live Classes</p>
      </div>

      {isInstructorView && (
        <form onSubmit={handleSchedule} className="mb-6 grid gap-3 rounded-lg border border-richblack-700 bg-richblack-800 p-4 md:grid-cols-2">
          <input
            type="text"
            className="form-style w-full"
            placeholder="Section Name"
            value={sectionName}
            onChange={(event) => setSectionName(event.target.value)}
            disabled={submitting}
          />
          <input
            type="text"
            className="form-style w-full"
            placeholder="Lecture Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={submitting}
          />
          <textarea
            className="form-style w-full md:col-span-2"
            placeholder="Lecture Description"
            value={lectureDescription}
            onChange={(event) => setLectureDescription(event.target.value)}
            disabled={submitting}
            rows={3}
          />
          <input
            type="datetime-local"
            className="form-style w-full"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting}
            className="yellowButton md:col-span-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Schedule New Live Class
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-richblack-300">Loading live classes...</p>
      ) : lectures.length === 0 ? (
        <p className="text-richblack-300">No live classes scheduled yet.</p>
      ) : (
        <div className="space-y-6">
          {isInstructorView && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-richblack-25">Live Queue</h3>
                <span className="rounded-full bg-richblack-700 px-3 py-1 text-xs text-richblack-200">
                  {activeLectures.length} active
                </span>
              </div>
              {activeLectures.length === 0 ? (
                <p className="rounded-lg border border-dashed border-richblack-600 bg-richblack-800/60 p-4 text-sm text-richblack-300">
                  No upcoming or currently live sessions.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeLectures.map((lecture) => (
                    <div
                      key={lecture._id}
                      className="rounded-lg border border-richblack-700 bg-richblack-800 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-richblack-5">{lecture.title}</p>
                          <p className="text-xs text-richblack-400">
                            Section: {lecture?.sectionId?.sectionName || "Not specified"}
                          </p>
                          <p className="text-sm text-richblack-300">
                            {formatDateTime(lecture.scheduledAt)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusStyles(
                            lecture.status
                          )}`}
                        >
                          {lecture.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {lecture.status === "scheduled" && (
                          <>
                            <button
                              type="button"
                              className="yellowButton"
                              onClick={() => handleStartClass(lecture)}
                            >
                              Start Class
                            </button>
                            <button
                              type="button"
                              className="blackButton"
                              onClick={() =>
                                setConfirmationModal({
                                  text1: "Cancel this live class?",
                                  text2:
                                    "This action will notify students and mark the class cancelled.",
                                  btn1Text: "Cancel Class",
                                  btn2Text: "Keep",
                                  btn1Handler: () => {
                                    setConfirmationModal(null)
                                    handleCancelClass(lecture._id)
                                  },
                                  btn2Handler: () => setConfirmationModal(null),
                                })
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {lecture.status === "live" && (
                          <button
                            type="button"
                            className="yellowButton"
                            onClick={() =>
                              navigate(`/live/instructor/${lecture.roomId}?lectureId=${lecture._id}`)
                            }
                          >
                            Rejoin Class
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(isInstructorView ? historyLectures : lectures).length > 0 && (
            <div>
              {isInstructorView && (
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-richblack-25">History</h3>
                  <span className="rounded-full bg-richblack-700 px-3 py-1 text-xs text-richblack-200">
                    {historyLectures.length} finished
                  </span>
                </div>
              )}
              <div className="space-y-3">
                {(isInstructorView ? historyLectures : lectures).map((lecture) => (
            <div
              key={lecture._id}
              className="rounded-lg border border-richblack-700 bg-richblack-800 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-richblack-5">{lecture.title}</p>
                  <p className="text-xs text-richblack-400">
                    Section: {lecture?.sectionId?.sectionName || "Not specified"}
                  </p>
                  <p className="text-sm text-richblack-300">
                    {formatDateTime(lecture.scheduledAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusStyles(
                    lecture.status
                  )}`}
                >
                  {lecture.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {isInstructorView && lecture.status === "scheduled" && (
                  <>
                    <button
                      type="button"
                      className="yellowButton"
                      onClick={() => handleStartClass(lecture)}
                    >
                      Start Class
                    </button>
                    <button
                      type="button"
                      className="blackButton"
                      onClick={() =>
                        setConfirmationModal({
                          text1: "Cancel this live class?",
                          text2: "This action will notify students and mark the class cancelled.",
                          btn1Text: "Cancel Class",
                          btn2Text: "Keep",
                          btn1Handler: () => {
                            setConfirmationModal(null)
                            handleCancelClass(lecture._id)
                          },
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                    >
                      Cancel
                    </button>
                  </>
                )}

                {!isInstructorView && lecture.status === "live" && (
                  <button
                    type="button"
                    className="yellowButton"
                    onClick={() => navigate(`/live/student/${lecture.roomId}`)}
                  >
                    Join Now
                  </button>
                )}

                {!isInstructorView && lecture.status === "scheduled" && (
                  <button
                    type="button"
                    disabled
                    className="blackButton cursor-not-allowed opacity-70"
                  >
                    Starts at {formatDateTime(lecture.scheduledAt)}
                  </button>
                )}

                {!isInstructorView && lecture.status === "cancelled" && (
                  <span className="rounded-md border border-pink-200/40 bg-pink-200/10 px-3 py-2 text-sm text-pink-100">
                    This class was cancelled by instructor
                  </span>
                )}

                {lecture.status === "ended" && lecture.recordingUrl && (
                  <a
                    href={toMediaUrl(lecture.recordingUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="yellowButton"
                  >
                    {isInstructorView ? "View Recording" : "Watch Recording"}
                  </a>
                )}
              </div>
            </div>
          ))}
              </div>
            </div>
          )}
        </div>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}
