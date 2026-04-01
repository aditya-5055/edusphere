
import { motion } from "framer-motion"
import { Settings as SettingsIcon, User, Lock, Trash2, Camera } from "lucide-react"
import ChangeProfilePicture from "./ChangeProfilePicture"
import DeleteAccount from "./DeleteAccount"
import EditProfile from "./EditProfile"
import UpdatePassword from "./UpdatePassword"

export default function Settings() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="rounded-xl bg-gradient-to-r from-yellow-400/20 to-yellow-200/20 p-3">
          <SettingsIcon className="h-8 w-8 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
            Settings
          </h1>
          <p className="text-richblack-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Picture Section */}
        <motion.div variants={itemVariants}>
          <ChangeProfilePicture />
        </motion.div>

        {/* Profile Information Section */}
        <motion.div variants={itemVariants}>
          <EditProfile />
        </motion.div>

        {/* Password Section */}
        <motion.div variants={itemVariants}>
          <UpdatePassword />
        </motion.div>

    <motion.div variants={itemVariants}>
      <DeleteAccount />
    </motion.div>

      </div>
    </motion.div>
  )
}