

import React, { useEffect, useState } from "react"
import { BiInfoCircle, BiBookOpen, BiUser, BiTime, BiStar } from "react-icons/bi"
import { HiOutlineGlobeAlt, HiOutlineAcademicCap } from "react-icons/hi"
import { MdOutlinePlayCircle, MdOutlineCheckCircle } from "react-icons/md"
import ReactMarkdown from "react-markdown"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import ConfirmationModal from "../components/Common/ConfirmationModal"
import Footer from "../components/Common/Footer"
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar"
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard"
import { formatDate } from "../services/formatDate"
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI"
import { BuyCourse } from "../services/operations/studentFeaturesAPI"
import GetAvgRating from "../utils/avgRating"
import Error from "./Error"

function CourseDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const { paymentLoading } = useSelector((state) => state.course)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Getting courseId from url parameter
  const { courseId } = useParams()

  // Declear a state to save the course details
  const [response, setResponse] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)
  
  useEffect(() => {
    // Calling fetchCourseDetails fucntion to fetch the details
    ;(async () => {
      try {
        const res = await fetchCourseDetails(courseId)
        setResponse(res)
      } catch (error) {
        console.error("Could not fetch Course Details")
      }
    })()
  }, [courseId])

  // Calculating Avg Review count
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    const count = GetAvgRating(response?.data?.courseDetails.ratingAndReviews)
    setAvgReviewCount(count)
  }, [response])

  const [isActive, setIsActive] = useState(Array(0))
  const handleActive = (id) => {
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e != id)
    )
  }

  // Total number of lectures
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  useEffect(() => {
    let lectures = 0
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0
    })
    setTotalNoOfLectures(lectures)
  }, [response])

  if (loading || !response) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }
  if (!response.success) {
    return <Error />
  }

  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnroled,
    createdAt,
  } = response.data?.courseDetails

  const handleBuyCourse = () => {
    if (token) {
      BuyCourse(token, [courseId], user, navigate, dispatch)
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  if (paymentLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section with Gradient Background */}
      <div className="relative w-full bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
        </div>

        <div className="relative mx-auto box-content px-4 lg:w-[1260px] 2xl:relative">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-12 xl:max-w-[810px]">
            
            {/* Mobile Thumbnail */}
            <div className="relative block w-full overflow-hidden rounded-xl lg:hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-richblack-900 via-transparent to-transparent"></div>
              <img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-video w-full object-cover"
              />
            </div>

            {/* Course Info */}
            <div className="z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5">
              {/* Badge */}
              <div className="inline-flex w-fit rounded-full bg-yellow-500/20 px-4 py-1 text-sm font-semibold text-yellow-100">
                <HiOutlineAcademicCap className="mr-2 text-lg" />
                {courseContent.length} Modules • {totalNoOfLectures} Lessons
              </div>

              {/* Title */}
              <div>
                <p className="text-4xl font-bold leading-tight text-richblack-5 sm:text-[42px]">
                  {courseName}
                </p>
              </div>

              {/* Description */}
              <p className="max-w-2xl text-lg text-richblack-200">{courseDescription}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 text-yellow-25">
                    <BiStar className="fill-current" />
                    <span className="font-semibold">{avgReviewCount.toFixed(1)}</span>
                  </div>
                  <span className="text-richblack-400">({ratingAndReviews.length} reviews)</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-richblack-600"></div>
                <span className="text-richblack-300">{studentsEnroled.length} students enrolled</span>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <img
                  src={
                    instructor.image ||
                    `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}`
                  }
                  alt={instructor.firstName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-yellow-500/50"
                />
                <span className="text-richblack-100">
                  Created by <span className="font-semibold text-yellow-25">{`${instructor.firstName} ${instructor.lastName}`}</span>
                </span>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-richblack-300">
                  <BiInfoCircle className="text-lg" />
                  <span>Last updated {formatDate(createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-richblack-300">
                  <HiOutlineGlobeAlt className="text-lg" />
                  <span>English</span>
                </div>
              </div>
            </div>

            {/* Mobile Buy Section */}
            <div className="flex w-full flex-col gap-4 border-y border-richblack-700 bg-richblack-800/50 py-6 backdrop-blur-sm lg:hidden">
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold text-yellow-25">₹{price}</p>
                <span className="text-sm text-richblack-300">Full lifetime access</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-richblack-900 transition-all hover:bg-yellow-400 hover:scale-105"
                  onClick={handleBuyCourse}
                >
                  Buy Now
                </button>
                <button className="rounded-lg border border-richblack-600 bg-richblack-800 px-6 py-3 font-semibold text-richblack-5 transition-all hover:border-yellow-500 hover:text-yellow-25">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Course Card - Desktop */}
          <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute lg:block">
            <CourseDetailsCard
              course={response?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto box-content px-4 text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          
          {/* What you'll learn section */}
          <div className="my-8 rounded-xl border border-richblack-700 bg-richblack-800/30 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <BiBookOpen className="text-3xl text-yellow-25" />
              <p className="text-2xl font-semibold">What you'll learn</p>
            </div>
            <div className="prose prose-invert mt-6 max-w-none">
              <ReactMarkdown
                components={{
                  ul: ({node, ...props}) => (
                    <ul className="grid gap-3 sm:grid-cols-2" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="flex items-start gap-2 text-richblack-100">
                      <MdOutlineCheckCircle className="mt-1 text-xl text-yellow-25 flex-shrink-0" />
                      <span>{props.children}</span>
                    </li>
                  ),
                }}
              >
                {whatYouWillLearn}
              </ReactMarkdown>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="max-w-[830px] py-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <MdOutlinePlayCircle className="text-3xl text-yellow-25" />
                <p className="text-2xl font-semibold">Course Content</p>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-richblack-800/50 p-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="rounded-full bg-richblack-700 px-3 py-1">
                    {courseContent.length} {courseContent.length === 1 ? 'Section' : 'Sections'}
                  </span>
                  <span className="rounded-full bg-richblack-700 px-3 py-1">
                    {totalNoOfLectures} {totalNoOfLectures === 1 ? 'Lecture' : 'Lectures'}
                  </span>
                  <span className="rounded-full bg-richblack-700 px-3 py-1">
                    <BiTime className="mr-1 inline" />
                    {response.data?.totalDuration}
                  </span>
                </div>
                <button
                  className="text-sm font-semibold text-yellow-25 transition-all hover:text-yellow-100"
                  onClick={() => setIsActive([])}
                >
                  Collapse all sections
                </button>
              </div>
            </div>

            {/* Course Details Accordion */}
            <div className="mt-6 space-y-2">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>

            {/* Author Details */}
            <div className="mt-12 rounded-xl border border-richblack-700 bg-richblack-800/30 p-8">
              <div className="flex items-center gap-2">
                <BiUser className="text-3xl text-yellow-25" />
                <p className="text-2xl font-semibold">About the Instructor</p>
              </div>
              
              <div className="mt-6 flex items-center gap-4">
                <img
                  src={
                    instructor.image ||
                    `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}`
                  }
                  alt="Author"
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-yellow-500/20"
                />
                <div>
                  <p className="text-xl font-semibold text-yellow-25">{`${instructor.firstName} ${instructor.lastName}`}</p>
                  <p className="text-sm text-richblack-300">Course Instructor</p>
                </div>
              </div>
              
              <p className="mt-4 text-richblack-100 leading-relaxed">
                {instructor?.additionalDetails?.about || "Experienced instructor passionate about teaching and helping students succeed in their learning journey."}
              </p>

              {/* Instructor Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-richblack-700 pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-25">5+</p>
                  <p className="text-xs text-richblack-300">Years Experience</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-25">10+</p>
                  <p className="text-xs text-richblack-300">Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-25">1000+</p>
                  <p className="text-xs text-richblack-300">Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default CourseDetails