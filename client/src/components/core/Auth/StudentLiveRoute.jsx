import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { Navigate, useParams } from "react-router-dom"

import { apiConnector } from "../../../services/apiConnector"
import { profileEndpoints } from "../../../services/apis"
import { ACCOUNT_TYPE } from "../../../utils/constants"

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

export default function StudentLiveRoute({ children }) {
  const { roomId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [matchedCourseId, setMatchedCourseId] = useState(null)

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  )

  useEffect(() => {
    const verifyEnrollmentForRoom = async () => {
      if (!token || !roomId || user?.accountType !== ACCOUNT_TYPE.STUDENT) {
        setAllowed(false)
        setChecking(false)
        return
      }

      try {
        const enrolledCoursesResponse = await apiConnector(
          "GET",
          profileEndpoints.GET_USER_ENROLLED_COURSES_API,
          null,
          headers
        )

        const enrolledCourses = enrolledCoursesResponse?.data?.data || []

        for (const course of enrolledCourses) {
          const courseId = course?._id
          if (!courseId) continue

          const lecturesResponse = await apiConnector(
            "GET",
            `${getLiveLectureApiBase()}/course/${courseId}`,
            null,
            headers
          )

          const lectures = lecturesResponse?.data?.data || []
          const hasRoom = lectures.some((lecture) => lecture?.roomId === roomId)

          if (hasRoom) {
            setMatchedCourseId(courseId)
            setAllowed(true)
            setChecking(false)
            return
          }
        }

        setAllowed(false)
      } catch {
        setAllowed(false)
      } finally {
        setChecking(false)
      }
    }

    verifyEnrollmentForRoom()
  }, [roomId, token, user, headers])

  if (checking) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/dashboard/enrolled-courses" />
  }

  return children(matchedCourseId)
}
