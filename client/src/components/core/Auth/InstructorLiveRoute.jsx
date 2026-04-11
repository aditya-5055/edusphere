import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

import { ACCOUNT_TYPE } from "../../../utils/constants"

export default function InstructorLiveRoute({ children }) {
  const { user } = useSelector((state) => state.profile)

  if (user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR) {
    return <Navigate to="/dashboard/my-profile" />
  }

  return children
}
