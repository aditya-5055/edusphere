import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { apiConnector } from "../../../services/apiConnector"
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"

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
  return "bg-yellow-100/20 text-yellow-25 border-yellow-100/40"
}

export default function StudentLiveClasses() {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : null),
    [token]
  )

  useEffect(() => {
    let isMounted = true

    const fetchAllLiveSessions = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const enrolledCourses = await getUserEnrolledCourses(token)
        const publishedCourses = (enrolledCourses || []).filter(
          (course) => course?.status !== "Draft"
        )

        if (!publishedCourses.length) {
          if (isMounted) {
            setSessions([])
          }
          return
        }

        const responses = await Promise.allSettled(
          publishedCourses.map((course) =>
            apiConnector(
              "GET",
              `${getLiveLectureApiBase()}/course/${course._id}`,
              null,
              headers
            )
          )
        )

        const allSessions = []

        responses.forEach((response, index) => {
          if (response.status !== "fulfilled") return

          const course = publishedCourses[index]
          const lectures = response.value?.data?.data || []

          lectures
            .filter((lecture) => ["scheduled", "live"].includes(lecture.status))
            .forEach((lecture) => {
              allSessions.push({
                ...lecture,
                courseId: course._id,
                courseName: course?.courseName || "Untitled Course",
                courseThumbnail: course?.thumbnail,
              })
            })
        })

        allSessions.sort((a, b) => {
          if (a.status !== b.status) {
            return a.status === "live" ? -1 : 1
          }
          return new Date(a.scheduledAt) - new Date(b.scheduledAt)
        })

        if (isMounted) {
          setSessions(allSessions)
        }
      } catch {
        if (isMounted) {
          setSessions([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAllLiveSessions()

    const intervalId = window.setInterval(fetchAllLiveSessions, 8000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [headers, token])

  if (loading) {
    return <p className="text-richblack-200">Loading live classes...</p>
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold text-richblack-5">Live Classes</h1>
        <p className="mt-1 text-sm text-richblack-300">
          Scheduled and live sessions across all your enrolled courses
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-richblack-700 bg-richblack-800/50 p-6 text-richblack-300">
          No scheduled or live classes are available right now.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="rounded-lg border border-richblack-700 bg-richblack-800 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-richblack-5">{session.title}</p>
                  <p className="text-sm text-richblack-300">{session.courseName}</p>
                  <p className="text-xs text-richblack-400">
                    Section: {session?.sectionId?.sectionName || "Not specified"}
                  </p>
                  <p className="text-xs text-richblack-400">
                    Starts at: {formatDateTime(session.scheduledAt)}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusStyles(
                    session.status
                  )}`}
                >
                  {session.status}
                </span>
              </div>

              {session.status === "live" ? (
                <button
                  type="button"
                  className="yellowButton mt-4"
                  onClick={() => navigate(`/live/student/${session.roomId}`)}
                >
                  Join Class
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 rounded-md bg-richblack-700 px-4 py-2 text-sm font-medium text-richblack-300"
                >
                  Scheduled
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}