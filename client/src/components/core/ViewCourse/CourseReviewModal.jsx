 
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { FaStar } from "react-icons/fa"
import { RxCross2 } from "react-icons/rx"
import { useSelector } from "react-redux"

import { createRating } from "../../../services/operations/courseDetailsAPI"
import IconBtn from "../../Common/IconBtn"

// ✅ Custom Star Rating Component (no external library needed)
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={30}
          className="cursor-pointer transition-colors duration-150"
          color={star <= (hovered || value) ? "#ffd700" : "#6b7280"}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  )
}

export default function CourseReviewModal({ setReviewModal }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { courseEntireData } = useSelector((state) => state.viewCourse)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  // ✅ Separate state to track rating
  const [selectedRating, setSelectedRating] = useState(0)

  useEffect(() => {
    setValue("courseExperience", "")
    setValue("courseRating", 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ratingChanged = (newRating) => {
    setSelectedRating(newRating)
    setValue("courseRating", newRating, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    if (!selectedRating || selectedRating < 1) {
      toast.error("Please select a star rating")
      return
    }

    const success = await createRating(
      {
        courseId: courseEntireData._id,
        rating: selectedRating,
        review: data.courseExperience,
      },
      token
    )

    if (success) {
      toast.success("Review submitted successfully!")
      setReviewModal(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">Add Review</p>
          <button onClick={() => setReviewModal(false)}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-x-4">
            <img
              src={user?.image}
              alt={user?.firstName + "profile"}
              className="aspect-square w-[50px] rounded-full object-cover"
            />
            <div className="">
              <p className="font-semibold text-richblack-5">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-richblack-5">Posting Publicly</p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col items-center"
          >
            {/* ✅ Custom stars replacing ReactStars */}
            <StarRating value={selectedRating} onChange={ratingChanged} />

            {/* Hidden input for react-hook-form validation */}
            <input
              type="hidden"
              {...register("courseRating", {
                min: { value: 1, message: "Please select a star rating" },
              })}
            />
            {errors.courseRating && (
              <span className="mb-2 text-xs tracking-wide text-pink-200">
                {errors.courseRating.message}
              </span>
            )}

            <div className="flex w-11/12 flex-col space-y-2">
              <label
                className="text-sm text-richblack-5"
                htmlFor="courseExperience"
              >
                Add Your Experience <sup className="text-pink-200">*</sup>
              </label>
              <textarea
                id="courseExperience"
                placeholder="Add Your Experience"
                {...register("courseExperience", { required: true })}
                className="form-style resize-x-none min-h-[130px] w-full"
              />
              {errors.courseExperience && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                  Please Add Your Experience
                </span>
              )}
            </div>
            <div className="mt-6 flex w-11/12 justify-end gap-x-2">
              <button
                onClick={() => setReviewModal(false)}
                className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}
              >
                Cancel
              </button>
              <IconBtn text="Save" />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}