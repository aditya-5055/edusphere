 

import React, { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { FaStar } from "react-icons/fa"
import { Autoplay, FreeMode, Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "../../index.css"

import { apiConnector } from "../../services/apiConnector"
import { ratingsEndpoints } from "../../services/apis"

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={16}
          color={star <= Math.round(rating) ? "#ffd700" : "#6b7280"}
        />
      ))}
    </div>
  )
}

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15
  const canLoop = reviews.length > 4

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        )
        if (data?.success) {
          setReviews(data?.data)
        }
      } catch (error) {
        // console.error("Error fetching reviews:", error)
      }
    }

    fetchReviews()
  }, [])

  return (
    <div className="text-white w-full">
      <div className="my-6 sm:my-10 w-full px-4 sm:px-6 lg:px-0 lg:max-w-maxContent mx-auto">
        <Swiper
          slidesPerView={1}
          spaceBetween={16}
          breakpoints={{
            // Mobile: 1 slide
            0: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
            // Tablet: 2 slides
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            // Desktop: 3 slides
            1024: {
              slidesPerView: 3,
              spaceBetween: 25,
            },
            // Large Desktop: 4 slides
            1280: {
              slidesPerView: 4,
              spaceBetween: 25,
            },
          }}
          loop={canLoop}
          freeMode={true}
          autoplay={
            canLoop
              ? {
                  delay: 2500,
                  disableOnInteraction: false,
                }
              : false
          }
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i}>
              <div className="flex h-full min-h-40 flex-col gap-3 rounded-lg bg-richblack-800 p-4 text-sm text-richblack-25">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={
                      review?.user?.image
                        ? review?.user?.image
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName}+${review?.user?.lastName}`
                    }
                    alt={`${review?.user?.firstName} ${review?.user?.lastName}`}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                  <div className="flex flex-col min-w-0">
                    <h1 className="font-semibold text-richblack-5 truncate">
                      {`${review?.user?.firstName} ${review?.user?.lastName}`}
                    </h1>
                    <h2 className="text-xs font-medium text-richblack-500 truncate">
                      {review?.course?.courseName}
                    </h2>
                  </div>
                </div>

                {/* Review Text */}
                <p className="grow text-xs font-medium leading-relaxed text-richblack-25 sm:text-sm">
                  {review?.review.split(" ").length > truncateWords
                    ? `${review?.review
                        .split(" ")
                        .slice(0, truncateWords)
                        .join(" ")} ...`
                    : review?.review}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-yellow-100 text-sm">
                    {review.rating.toFixed(1)}
                  </h3>
                  <StarDisplay rating={review.rating} />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider