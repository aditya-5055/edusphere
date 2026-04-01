import { FcGoogle } from "react-icons/fc"
import { useSelector } from "react-redux"
import frameImg from "../../../assets/Images/frame.png"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

function Template({ title, description1, description2, image, formType }) {
  const { loading } = useSelector((state) => state.auth)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-8 px-4">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Left Content */}
          <div className="w-full max-w-md lg:max-w-lg">
            <h1 className="text-2xl md:text-3xl font-semibold text-richblack-5 mb-4">
              {title}
            </h1>
            <p className="text-richblack-100 mb-6">
              <span>{description1}</span>{" "}
              <span className="font-edu-sa font-bold italic text-blue-100">
                {description2}
              </span>
            </p>
            {formType === "signup" ? <SignupForm /> : <LoginForm />}
          </div>
          
          {/* Right Image */}
          <div className="relative w-full max-w-md lg:max-w-lg flex justify-center">
            <img
              src={image}
              alt="Students"
              className="w-full h-auto max-w-md object-contain relative z-10"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Template