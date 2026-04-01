
import { useState } from "react"
import { FiTrash2, FiAlertTriangle } from "react-icons/fi"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { deleteProfile } from "../../../../services/operations/SettingsAPI"

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)  // ✅ get user
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)

  function handleDeleteAccount() {
    dispatch(deleteProfile(token, navigate))
  }

  // ✅ If instructor, don't show delete section at all
  if (user?.accountType === "Instructor") {
    return (
      <div className="my-10 flex flex-row items-start gap-x-6 overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800 p-8 px-10">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-richblack-700">
          <FiTrash2 className="text-2xl text-richblack-400" />
        </div>
        <div className="flex flex-col gap-y-2">
          <h2 className="text-lg font-bold text-richblack-5">Delete Account</h2>
          <p className="text-sm text-richblack-400">
            Instructor accounts cannot be deleted directly. Please contact{" "}
            <span className="font-semibold text-yellow-400">
              noreply.edusphereacademy@gmail.com
            </span>{" "}
            to request account deletion.
          </p>
        </div>
      </div>
    )
  }

  // ✅ Only Students see this
  return (
    <>
      <div className="my-10 overflow-hidden rounded-2xl border border-pink-700 bg-gradient-to-br from-pink-950 via-pink-900 to-richblack-900 shadow-lg">
        <div className="flex flex-row items-start gap-x-6 p-8 px-10">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink-700 shadow-md shadow-pink-900">
            <FiTrash2 className="text-2xl text-pink-200" />
          </div>
          <div className="flex flex-col gap-y-3">
            <h2 className="text-lg font-bold text-richblack-5">
              Delete Account
            </h2>
            <div className="space-y-1 text-sm text-pink-200 leading-relaxed">
              <p>Would you like to delete your account?</p>
              <p className="text-pink-300">
                This account may contain Paid Courses. Deleting your account is
                permanent and will remove all the content associated with it.
              </p>
            </div>
            <button
              type="button"
              className="w-fit rounded-lg border border-pink-600 bg-pink-800 px-4 py-2 text-sm font-medium text-pink-200 transition-all duration-200 hover:bg-pink-700 hover:text-white"
              onClick={() => setShowModal(true)}
            >
              I want to delete my account.
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-richblack-700 bg-richblack-800 p-8 shadow-2xl">
            <button
              className="absolute right-4 top-4 text-richblack-400 hover:text-richblack-100 transition-colors"
              onClick={() => setShowModal(false)}
            >
              <RxCross2 className="text-xl" />
            </button>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pink-900 border border-pink-700">
              <FiAlertTriangle className="text-2xl text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-richblack-5">
              Delete Your Account?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-richblack-300">
              This action is{" "}
              <span className="font-semibold text-pink-400">permanent</span> and
              cannot be undone. All your courses, progress, and data will be
              removed forever.
            </p>
            <div className="my-6 h-px w-full bg-richblack-700" />
            <div className="flex justify-end gap-x-3">
              <button
                className="rounded-xl border border-richblack-600 bg-richblack-700 px-5 py-2.5 text-sm font-semibold text-richblack-100 transition-all duration-200 hover:bg-richblack-600"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-pink-500"
                onClick={handleDeleteAccount}
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}