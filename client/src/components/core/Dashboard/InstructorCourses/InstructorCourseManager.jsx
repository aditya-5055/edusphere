import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { FiEdit2 } from "react-icons/fi"
import { HiOutlineCollection, HiOutlineClock, HiOutlinePresentationChartBar } from "react-icons/hi"

import LiveClassesSection from "../../../live/LiveClassesSection"
import { getFullDetailsOfCourse } from "../../../../services/operations/courseDetailsAPI"

export default function InstructorCourseManager() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [courseData, setCourseData] = useState(null)
  const [activeTab, setActiveTab] = useState("content")

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId || !token) {
        setLoading(false)
        return
      }

      setLoading(true)
      const response = await getFullDetailsOfCourse(courseId, token)
      if (response?.courseDetails) {
        setCourseData(response.courseDetails)
      }
      setLoading(false)
    }

    loadCourse()
  }, [courseId, token])

  const sectionCount = useMemo(
    () => courseData?.courseContent?.length || 0,
    [courseData]
  )

  const lectureCount = useMemo(() => {
    if (!courseData?.courseContent?.length) return 0
    return courseData.courseContent.reduce(
      (total, section) => total + (section?.subSection?.length || 0),
      0
    )
  }, [courseData])

  const stats = [
    {
      label: "Sections",
      value: sectionCount,
      icon: HiOutlineCollection,
    },
    {
      label: "Lectures",
      value: lectureCount,
      icon: HiOutlinePresentationChartBar,
    },
    {
      label: "Duration",
      value: courseData?.totalDuration || "TBD",
      icon: HiOutlineClock,
    },
  ]

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="text-richblack-5">
        <p className="text-2xl font-semibold">Course not found</p>
      </div>
    )
  }

  return (
    <div className="text-richblack-5">
      <div className="relative overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800/60 p-6">
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-yellow-100/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/my-courses")}
              className="w-fit text-sm text-richblack-300 hover:text-yellow-50"
            >
              Back to My Courses
            </button>

            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl">{courseData.courseName}</h1>
              <p className="mt-1 max-w-3xl text-sm text-richblack-300">
                {courseData.courseDescription || "Manage your content and conduct professional live classes from one place."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/dashboard/edit-course/${courseData._id}`)}
            className="yellowButton inline-flex items-center gap-2"
          >
            <FiEdit2 />
            Edit Course
          </button>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="rounded-xl border border-richblack-700 bg-richblack-900/70 p-4"
              >
                <div className="mb-2 inline-flex rounded-lg bg-richblack-700 p-2 text-yellow-50">
                  <Icon size={18} />
                </div>
                <p className="text-2xl font-semibold text-richblack-5">{item.value}</p>
                <p className="text-xs uppercase tracking-wide text-richblack-300">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-richblack-700 bg-richblack-800 p-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "content"
                ? "bg-yellow-50 text-richblack-900"
                : "text-richblack-200 hover:bg-richblack-700"
            }`}
          >
            Course Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "live"
                ? "bg-yellow-50 text-richblack-900"
                : "text-richblack-200 hover:bg-richblack-700"
            }`}
          >
            Live Classes
          </button>
        </div>
      </div>

      {activeTab === "content" ? (
        <div className="mt-6 space-y-4 rounded-xl border border-richblack-700 bg-richblack-800/40 p-5">
          {courseData.courseContent?.length ? (
            courseData.courseContent.map((section, sectionIndex) => (
              <div
                key={section._id}
                className="rounded-xl border border-richblack-700 bg-richblack-800 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-richblack-5 sm:text-lg">
                    {sectionIndex + 1}. {section.sectionName}
                  </p>
                  <span className="rounded-full bg-richblack-700 px-3 py-1 text-xs text-richblack-200">
                    {section.subSection?.length || 0} lectures
                  </span>
                </div>

                {section.subSection?.length ? (
                  <ul className="space-y-2 text-sm text-richblack-200">
                    {section.subSection.map((lecture, lectureIndex) => (
                      <li
                        key={lecture._id}
                        className="flex items-center justify-between gap-3 rounded-md border border-richblack-700 bg-richblack-900/60 px-3 py-2"
                      >
                        <span className="truncate">
                          {lectureIndex + 1}. {lecture.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-richblack-300">No lectures in this section yet.</p>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-richblack-600 bg-richblack-800/60 p-6 text-center text-richblack-300">
              No sections found for this course yet.
            </div>
          )}
        </div>
      ) : (
        <LiveClassesSection courseId={courseId} isInstructorView={true} />
      )}
    </div>
  )
}
