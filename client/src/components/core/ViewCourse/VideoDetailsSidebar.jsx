import { useEffect, useState } from "react"
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"
import { useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import IconBtn from "../../Common/IconBtn"
import { apiConnector } from "../../../services/apiConnector"

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

export default function VideoDetailsSidebar({ setReviewModal }) {
  const [activeStatus, setActiveStatus] = useState("")
  const [videoBarActive, setVideoBarActive] = useState("")
  const [activeTab, setActiveTab] = useState("content")
  const [liveLectures, setLiveLectures] = useState([])
  const [liveLoading, setLiveLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { sectionId, subSectionId, courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse)

  useEffect(() => {
    ;(() => {
      if (!courseSectionData.length) return
      const currentSectionIndx = courseSectionData.findIndex(
        (data) => data._id === sectionId
      )
      const currentSubSectionIndx = courseSectionData?.[
        currentSectionIndx
      ]?.subSection.findIndex((data) => data._id === subSectionId)
      const activeSubSectionId =
        courseSectionData[currentSectionIndx]?.subSection?.[
          currentSubSectionIndx
        ]?._id
      setActiveStatus(courseSectionData?.[currentSectionIndx]?._id)
      setVideoBarActive(activeSubSectionId)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSectionData, courseEntireData, location.pathname])

  useEffect(() => {
    if (!token || !courseId) return

    const fetchLiveLectures = async (showLoader = true) => {
      try {
        if (showLoader) {
          setLiveLoading(true)
        }
        const response = await apiConnector(
          "GET",
          `${getLiveLectureApiBase()}/course/${courseId}`,
          null,
          { Authorization: `Bearer ${token}` }
        )

        const data = response?.data?.data || []
        setLiveLectures(
          data.filter((lecture) => ["scheduled", "live"].includes(lecture.status))
        )
      } catch {
        setLiveLectures([])
      } finally {
        if (showLoader) {
          setLiveLoading(false)
        }
      }
    }

    fetchLiveLectures(true)
    const intervalId = window.setInterval(() => {
      fetchLiveLectures(false)
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [courseId, token])

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
        <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
          <div className="flex w-full items-center justify-between ">
            <div
              onClick={() => {
                navigate(`/dashboard/enrolled-courses`)
              }}
              className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90"
              title="back"
            >
              <IoIosArrowBack size={30} />
            </div>
            <IconBtn
              text="Add Review"
              customClasses="ml-auto"
              onclick={() => setReviewModal(true)}
            />
          </div>
          <div className="flex flex-col">
            <p>{courseEntireData?.courseName}</p>
            <p className="text-sm font-semibold text-richblack-500">
              {completedLectures?.length} / {totalNoOfLectures}
            </p>
          </div>
        </div>

        <div className="px-3 pt-3">
          <div className="grid grid-cols-2 gap-2 rounded-md border border-richblack-700 bg-richblack-900 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition-all ${
                activeTab === "content"
                  ? "bg-yellow-50 text-richblack-900"
                  : "text-richblack-200"
              }`}
            >
              Course Content
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("live")}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition-all ${
                activeTab === "live"
                  ? "bg-yellow-50 text-richblack-900"
                  : "text-richblack-200"
              }`}
            >
              Live Now
            </button>
          </div>
        </div>

        <div className="h-[calc(100vh-9.5rem)] overflow-y-auto">
          {activeTab === "content" && courseSectionData.map((course, index) => (
            <div
              className="mt-2 cursor-pointer text-sm text-richblack-5"
              onClick={() => setActiveStatus(course?._id)}
              key={index}
            >
              {/* Section */}
              <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                <div className="w-[70%] font-semibold">
                  {course?.sectionName}
                </div>
                <div className="flex items-center gap-3">
                  {/* <span className="text-[12px] font-medium">
                    Lession {course?.subSection.length}
                  </span> */}
                  <span
                    className={`${
                      activeStatus === course?.sectionName
                        ? "rotate-0"
                        : "rotate-180"
                    } transition-all duration-500`}
                  >
                    <BsChevronDown />
                  </span>
                </div>
              </div>

              {/* Sub Sections */}
              {activeStatus === course?._id && (
                <div className="transition-[height] duration-500 ease-in-out">
                  {course.subSection.map((topic, i) => (
                    <div
                      className={`flex gap-3  px-5 py-2 ${
                        videoBarActive === topic._id
                          ? "bg-yellow-200 font-semibold text-richblack-800"
                          : "hover:bg-richblack-900"
                      } `}
                      key={i}
                      onClick={() => {
                        navigate(
                          `/view-course/${courseEntireData?._id}/section/${course?._id}/sub-section/${topic?._id}`
                        )
                        setVideoBarActive(topic._id)
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={completedLectures.includes(topic?._id)}
                        onChange={() => {}}
                      />
                      {topic.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {activeTab === "live" && (
            <div className="space-y-3 p-3">
              {liveLoading ? (
                <p className="text-sm text-richblack-300">Loading live sessions...</p>
              ) : liveLectures.length === 0 ? (
                <p className="rounded-md border border-dashed border-richblack-600 bg-richblack-900/60 p-3 text-sm text-richblack-300">
                  No scheduled or live classes for this course right now.
                </p>
              ) : (
                liveLectures.map((lecture) => (
                  <div
                    key={lecture._id}
                    className="rounded-md border border-richblack-700 bg-richblack-900 p-3"
                  >
                    <p className="text-sm font-semibold text-richblack-5">{lecture.title}</p>
                    <p className="mt-1 text-xs text-richblack-300">
                      {formatDateTime(lecture.scheduledAt)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                          lecture.status === "live"
                            ? "bg-green-200/20 text-green-25"
                            : "bg-yellow-100/20 text-yellow-25"
                        }`}
                      >
                        {lecture.status}
                      </span>

                      {lecture.status === "live" ? (
                        <button
                          type="button"
                          className="rounded bg-yellow-50 px-3 py-1 text-xs font-semibold text-richblack-900"
                          onClick={() => navigate(`/live/student/${lecture.roomId}`)}
                        >
                          Join
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded bg-richblack-700 px-3 py-1 text-xs text-richblack-300"
                        >
                          Scheduled
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
