const LiveLecture = require("../models/LiveLecture")

const INSTRUCTOR_DISCONNECT_GRACE_MS = 90 * 1000

const roomInstructorSockets = new Map()
const autoEndTimers = new Map()
const roomParticipants = new Map()
// send the list of participent to frontend 
const emitRoomParticipants = (io, roomId) => {
  if (!roomId) return

  const participants = Array.from(roomParticipants.get(roomId)?.values() || [])
  io.to(roomId).emit("room-participants", {
    roomId,
    participants,
  })
}
// this fubnction use to make delete a room id auto when the instructor is disconnect for more that  2 min
const clearAutoEndTimer = (roomId) => {
  const timer = autoEndTimers.get(roomId)
  if (timer) {
    clearTimeout(timer)
    autoEndTimers.delete(roomId)
  }
}

const scheduleAutoEndIfInstructorAbsent = (io, roomId) => {
  if (!roomId) return

  clearAutoEndTimer(roomId)

  const timeout = setTimeout(async () => {
    const instructorsInRoom = roomInstructorSockets.get(roomId)
    if (instructorsInRoom && instructorsInRoom.size > 0) {
      return
    }

    try {
      const lecture = await LiveLecture.findOne({ roomId })
      if (!lecture || lecture.status !== "live") {
        return
      }

      lecture.status = "ended"
      await lecture.save()

      io.to(roomId).emit("lecture-status", {
        lectureId: lecture._id,
        roomId: lecture.roomId,
        status: "ended",
      })

      io.to(roomId).emit("lecture-ended", {
        lectureId: lecture._id,
        roomId: lecture.roomId,
      })
    } catch {
      // Keep socket server resilient even if DB update fails.
    } finally {
      autoEndTimers.delete(roomId)
    }
  }, INSTRUCTOR_DISCONNECT_GRACE_MS)

  autoEndTimers.set(roomId, timeout)
}

function registerLiveLectureSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, userId, role, name }) => {
      if (!roomId || !userId) {
        return
      }

      socket.join(roomId)
      socket.data.roomId = roomIds
      socket.data.userId = userId
      socket.data.role = role
      socket.data.name = name || "User"

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map())
      }
// store who is presrn inside this room
      roomParticipants.get(roomId).set(socket.id, {
        socketId: socket.id,
        userId,
        role,
        name: socket.data.name,
      })
// we store instructor sockets for disconnecting them if they disconnect for more than 90 seconds in backent the instructor id is store so we need to chekck does he disconnect or not
      if (role === "instructor") {
        if (!roomInstructorSockets.has(roomId)) {
          roomInstructorSockets.set(roomId, new Set())
        }
        roomInstructorSockets.get(roomId).add(socket.id)
        clearAutoEndTimer(roomId)
      }
// tell the other in room that i am join this room and also send them data for making them enable to make a peer connection 
      socket.to(roomId).emit("user-joined", {
        roomId,
        userId,
        role,
        name: socket.data.name,
        socketId: socket.id,
      })
// tell or updte the participent list when user join or left the room 
      io.to(roomId).emit("participant-updated", {
        roomId,
      })
      emitRoomParticipants(io, roomId)
    })

    socket.on("offer", ({ roomId, offer, to }) => {
      if (!to || !offer) {
        return
      }
// make a ffer for webrtc by the signiling server
      io.to(to).emit("offer", {
        roomId,
        offer,
        from: socket.id,
        userId: socket.data.userId || null,
        name: socket.data.name || "User",
      })
    })
// student send the answer for peer connecion 
    socket.on("answer", ({ roomId, answer, to }) => {
      if (!to || !answer) {
        return
      }

      io.to(to).emit("answer", {
        roomId,
        answer,
        from: socket.id,
        userId: socket.data.userId || null,
        name: socket.data.name || "User",
      })
    })
// exchange ice canditate for establishing peer connection 
    socket.on("ice-candidate", ({ roomId, candidate, to }) => {
      if (!to || !candidate) {
        return
      }

      io.to(to).emit("ice-candidate", {
        roomId,
        candidate,
        from: socket.id,
        userId: socket.data.userId || null,
        name: socket.data.name || "User",
      })
    })

    socket.on("mute-student", ({ roomId, studentSocketId }) => {
      if (socket.data.role !== "instructor") {
        return
      }

      if (!studentSocketId) {
        return
      }

      io.to(studentSocketId).emit("force-mute", {
        roomId,
        by: socket.id,
      })
    })

    socket.on("unmute-student", ({ roomId, studentSocketId }) => {
      if (socket.data.role !== "instructor") {
        return
      }

      if (!studentSocketId) {
        return
      }

      io.to(studentSocketId).emit("force-unmute", {
        roomId,
        by: socket.id,
      })
    })

    socket.on("request-unmute", ({ roomId, userId }) => {
      if (socket.data.role !== "student" || !roomId) {
        return
      }

      socket.to(roomId).emit("unmute-request", {
        roomId,
        userId: userId || socket.data.userId,
        name: socket.data.name || "Student",
        socketId: socket.id,
      })
    })

    socket.on("chat-message", (payload) => {
      const roomId = payload?.roomId || socket.data.roomId
      if (!roomId || (!payload?.text && !payload?.mediaUrl)) {
        return
      }

      const normalizedPayload = {
        ...payload,
        userId: payload.userId || socket.data.userId || null,
        name: payload.name || socket.data.name || "User",
      }

      socket.to(roomId).emit("chat-message", {
        ...normalizedPayload,
      })
    })

    socket.on("pip-position-update", ({ roomId, xRatio, yRatio }) => {
      if (socket.data.role !== "instructor" || !roomId) {
        return
      }

      if (typeof xRatio !== "number" || typeof yRatio !== "number") {
        return
      }

      socket.to(roomId).emit("pip-position-updated", {
        xRatio,
        yRatio,
      })
    })

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId
      const userId = socket.data.userId
      const role = socket.data.role

      if (!roomId || !userId) {
        return
      }

      const roomParticipantMap = roomParticipants.get(roomId)
      if (roomParticipantMap) {
        roomParticipantMap.delete(socket.id)
        if (roomParticipantMap.size === 0) {
          roomParticipants.delete(roomId)
        }
      }

      if (role === "instructor") {
        const roomInstructorSet = roomInstructorSockets.get(roomId)
        if (roomInstructorSet) {
          roomInstructorSet.delete(socket.id)
          if (roomInstructorSet.size === 0) {
            roomInstructorSockets.delete(roomId)
            scheduleAutoEndIfInstructorAbsent(io, roomId)
          }
        } else {
          scheduleAutoEndIfInstructorAbsent(io, roomId)
        }
      }

      socket.to(roomId).emit("user-left", { roomId, userId, socketId: socket.id })
      io.to(roomId).emit("participant-updated", {
        roomId,
      })
      emitRoomParticipants(io, roomId)
    })
  })
}

module.exports = { registerLiveLectureSocket }
