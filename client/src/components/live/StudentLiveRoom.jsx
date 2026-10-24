import { useEffect, useMemo, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { io } from "socket.io-client"
import { apiConnector } from "../../services/apiConnector"
import { uploadToCloudinary } from "../../utils/cloudinaryUpload"
import { Maximize2, Mic, MicOff, Minimize2, Paperclip, PhoneOff, Send } from "lucide-react"

const getRtcConfig = () => {
  const stunList =
    (import.meta.env.VITE_WEBRTC_STUN_URLS || "stun:stun.l.google.com:19302")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)

  const iceServers = [{ urls: stunList }]

  const turnUrl = import.meta.env.VITE_WEBRTC_TURN_URL
  const turnUsername = import.meta.env.VITE_WEBRTC_TURN_USERNAME
  const turnCredential = import.meta.env.VITE_WEBRTC_TURN_CREDENTIAL

  if (turnUrl && turnUsername && turnCredential) {
    iceServers.push({
      urls: [turnUrl],
      username: turnUsername,
      credential: turnCredential,
    })
  }

  return { iceServers }
}

const getSocketUrl = () => {
  // Always prefer an explicit socket URL if provided.
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL
  if (explicitSocketUrl) {
    return explicitSocketUrl
  }

  // Derive the socket origin from the backend API base URL.
  // We must NOT fall back to window.location.origin here because
  // on a different device the frontend may be served from a Vite
  // dev-server port (e.g. :5173) that has no socket server on it.
  const baseUrl = import.meta.env.VITE_BASE_URL
  if (baseUrl) {
    try {
      return new URL(baseUrl).origin
    } catch {
      // baseUrl is malformed — fall through to location origin.
    }
  }

  return window.location.origin
}

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

const formatTime = (isoString) => {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

export default function StudentLiveRoom({ roomId: roomIdProp, courseId: courseIdProp }) {
  const { roomId: roomIdParam, courseId: courseIdParam } = useParams()
  const roomId = roomIdProp || roomIdParam
  const courseId = courseIdProp || courseIdParam

  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const socketRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const instructorSocketIdRef = useRef(null)
  const localMicStreamRef = useRef(null)
  const mainStreamRef = useRef(new MediaStream())
  const cameraStreamRef = useRef(new MediaStream())
  const remoteAudioStreamRef = useRef(new MediaStream())
  const remoteAudioRef = useRef(null)
  const sharedAreaRef = useRef(null)
  const studentStageRef = useRef(null)
  const fileInputRef = useRef(null)

  const mainVideoRef = useRef(null)
  const instructorCameraRef = useRef(null)

  const [lectureStatus, setLectureStatus] = useState("live")
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState([])

  const [isMicEnabled, setIsMicEnabled] = useState(false)
  const [canUseMic, setCanUseMic] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chatUploadLoading, setChatUploadLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [instructorPipPosition, setInstructorPipPosition] = useState(null)

  const stageHeightClass = useMemo(() => {
    if (isFullscreen) {
      return isChatOpen
        ? "h-[calc(100vh-8.5rem)]"
        : "h-[calc(100vh-7rem)]"
    }

    if (isChatOpen) {
      return "h-[50vh] md:h-[60vh] xl:h-[66vh]"
    }

    return "h-[55vh] md:h-[65vh] xl:h-[70vh]"
  }, [isChatOpen, isFullscreen])

  const userId = useMemo(() => user?._id || user?.id || "student", [user])
  const userName = useMemo(() => {
    const first = user?.firstName || ""
    const last = user?.lastName || ""
    const full = `${first} ${last}`.trim()
    return full || user?.email || "Student"
  }, [user])

  const attachRemoteTrack = (track) => {
    if (track.kind !== "video") return

    const currentMainTracks = mainStreamRef.current.getVideoTracks()
    const currentCameraTracks = cameraStreamRef.current.getVideoTracks()

    if (currentMainTracks.length === 0) {
      mainStreamRef.current.addTrack(track)
      if (mainVideoRef.current) {
        mainVideoRef.current.srcObject = mainStreamRef.current
      }
      return
    }

    if (currentCameraTracks.length === 0) {
      cameraStreamRef.current.addTrack(track)
      if (instructorCameraRef.current) {
        instructorCameraRef.current.srcObject = cameraStreamRef.current
      }
      return
    }

    const oldTrack = currentMainTracks[0]
    mainStreamRef.current.removeTrack(oldTrack)
    mainStreamRef.current.addTrack(track)
    if (mainVideoRef.current) {
      mainVideoRef.current.srcObject = mainStreamRef.current
    }
  }

  const createPeerConnection = () => {
    if (peerConnectionRef.current) return peerConnectionRef.current

    const pc = new RTCPeerConnection(getRtcConfig())

    pc.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current || !roomId || !instructorSocketIdRef.current) {
        return
      }

      socketRef.current.emit("ice-candidate", {
        roomId,
        candidate: event.candidate,
        to: instructorSocketIdRef.current,
      })
    }

    pc.ontrack = (event) => {
      setLectureStatus("live")
      const [stream] = event.streams

      if (stream) {
        stream.getTracks().forEach((track) => {
          if (track.kind === "video") {
            attachRemoteTrack(track)
          } else if (track.kind === "audio") {
            remoteAudioStreamRef.current.addTrack(track)
            if (remoteAudioRef.current) {
              remoteAudioRef.current.srcObject = remoteAudioStreamRef.current
            }
          }
        })
        return
      }

      if (event.track.kind === "video") {
        attachRemoteTrack(event.track)
      }
      if (event.track.kind === "audio") {
        remoteAudioStreamRef.current.addTrack(event.track)
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteAudioStreamRef.current
        }
      }
    }

    peerConnectionRef.current = pc
    return pc
  }

  const sendOfferToInstructor = async () => {
    if (!peerConnectionRef.current || !socketRef.current || !roomId || !instructorSocketIdRef.current) {
      return
    }

    const offer = await peerConnectionRef.current.createOffer()
    await peerConnectionRef.current.setLocalDescription(offer)

    socketRef.current.emit("offer", {
      roomId,
      offer,
      to: instructorSocketIdRef.current,
    })
  }

  const enableLocalMic = async () => {
    if (!canUseMic) return

    try {
      if (!localMicStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })
        localMicStreamRef.current = stream
      }

      const audioTrack = localMicStreamRef.current.getAudioTracks()[0]
      if (!audioTrack) return

      audioTrack.enabled = true

      const pc = createPeerConnection()
      const existingSender = pc.getSenders().find((sender) => sender.track?.kind === "audio")

      if (existingSender) {
        await existingSender.replaceTrack(audioTrack)
      } else {
        pc.addTrack(audioTrack, localMicStreamRef.current)
      }

      await sendOfferToInstructor()
      setIsMicEnabled(true)
    } catch {
      setIsMicEnabled(false)
    }
  }

  const disableLocalMic = async () => {
    const stream = localMicStreamRef.current
    const track = stream?.getAudioTracks?.()[0]

    if (track) {
      track.enabled = false
    }

    const pc = peerConnectionRef.current
    if (pc) {
      const sender = pc.getSenders().find((item) => item.track?.kind === "audio")
      if (sender) {
        await sender.replaceTrack(null)
      }
    }

    if (instructorSocketIdRef.current) {
      await sendOfferToInstructor()
    }

    setIsMicEnabled(false)
  }

  const handleMicButton = async () => {
    if (!socketRef.current || !roomId) return

    if (!canUseMic) {
      socketRef.current.emit("request-unmute", {
        roomId,
        userId,
      })
      return
    }

    if (isMicEnabled) {
      await disableLocalMic()
    } else {
      await enableLocalMic()
    }
  }

  const handleLeaveClass = () => {
    navigate("/dashboard/enrolled-courses")
  }

  const sendChatMessage = () => {
    const text = chatInput.trim()
    if (!text || !socketRef.current || !roomId) return

    const payload = {
      roomId,
      userId,
      name: userName,
      text,
      at: new Date().toISOString(),
      role: "student",
    }

    socketRef.current.emit("chat-message", payload)
    setChatMessages((prev) => [...prev, payload])
    setChatInput("")
  }

  const handleAttachChatMedia = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !token || !roomId || !socketRef.current) return

    try {
      setChatUploadLoading(true)
      const uploadRes = await uploadToCloudinary({
        file,
        folderType: "live-chat",
        resourceType: "auto",
        token,
      })

      const mediaUrl = uploadRes.secure_url
      const mediaType = uploadRes.resource_type || "image"
      if (!mediaUrl) return

      const payload = {
        roomId,
        userId,
        name: userName,
        text: "",
        mediaUrl,
        mediaType,
        at: new Date().toISOString(),
        role: "student",
      }

      socketRef.current.emit("chat-message", payload)
      setChatMessages((prev) => [...prev, payload])
    } catch {
      // Keep chat usable for text even if media upload fails.
    } finally {
      setChatUploadLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const toggleFullscreen = async () => {
    if (!sharedAreaRef.current) return

    if (!document.fullscreenElement) {
      await sharedAreaRef.current.requestFullscreen()
      return
    }

    await document.exitFullscreen()
  }

  useEffect(() => {
    if (lectureStatus !== "ended" && lectureStatus !== "cancelled") return

    const timeoutId = window.setTimeout(() => {
      navigate("/dashboard/enrolled-courses")
    }, 3000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [lectureStatus, navigate])

  useEffect(() => {
    if (!roomId || !token) return

    const fetchLectureStatus = async () => {
      try {
        const response = await apiConnector(
          "GET",
          `${getLiveLectureApiBase()}/room/${roomId}`,
          null,
          { Authorization: `Bearer ${token}` }
        )

        const status = response?.data?.data?.status
        if (status) {
          setLectureStatus(status)
        }
      } catch {
        // Keep socket-driven fallback when this endpoint context isn't available.
      }
    }

    fetchLectureStatus()
    const intervalId = window.setInterval(fetchLectureStatus, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [roomId, token])

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", onFullScreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange)
    }
  }, [])

  useEffect(() => {
    if (!roomId) return

    const socket = io(getSocketUrl(), {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("join-room", {
        roomId,
        userId,
        name: userName,
        role: "student",
      })
    })

    socket.on("connect_error", () => {
      // Keep status polling fallback, but surface connectivity problems.
      console.warn("Live socket connection issue. Retrying...")
    })

    socket.on("offer", async ({ offer, from }) => {
      if (!offer || !from) return

      instructorSocketIdRef.current = from

      const pc = createPeerConnection()
      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      socket.emit("answer", {
        roomId,
        answer,
        to: from,
      })
    })

    socket.on("answer", async ({ answer }) => {
      const pc = peerConnectionRef.current
      if (!pc || !answer) return
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    })

    socket.on("ice-candidate", async ({ candidate }) => {
      const pc = peerConnectionRef.current
      if (!pc || !candidate) return
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    })

    socket.on("force-unmute", async () => {
      setCanUseMic(true)
      await enableLocalMic()
    })

    socket.on("force-mute", async () => {
      await disableLocalMic()
      setCanUseMic(false)
    })

    socket.on("lecture-status", ({ status }) => {
      if (!status) return
      setLectureStatus(status)
    })

    socket.on("lecture-ended", () => {
      setLectureStatus("ended")
    })

    socket.on("lecture-cancelled", () => {
      setLectureStatus("cancelled")
    })

    socket.on("chat-message", (payload) => {
      if (!payload?.text && !payload?.mediaUrl) return
      setChatMessages((prev) => [...prev, payload])
    })

    socket.on("pip-position-updated", ({ xRatio, yRatio }) => {
      const width = 240
      const height = 144
      const stageRect = studentStageRef.current?.getBoundingClientRect()

      if (!stageRect) return

      const maxX = Math.max(0, stageRect.width - width)
      const maxY = Math.max(0, stageRect.height - height)

      setInstructorPipPosition({
        x: Math.max(0, Math.min(maxX, xRatio * maxX)),
        y: Math.max(0, Math.min(maxY, yRatio * maxY)),
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }

      if (localMicStreamRef.current) {
        localMicStreamRef.current.getTracks().forEach((track) => track.stop())
        localMicStreamRef.current = null
      }

      mainStreamRef.current = new MediaStream()
      cameraStreamRef.current = new MediaStream()
      remoteAudioStreamRef.current = new MediaStream()
      instructorSocketIdRef.current = null

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, userName])

  if (lectureStatus === "ended" || lectureStatus === "cancelled") {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-content-center bg-richblack-900 text-center text-richblack-5">
        <h2 className="text-2xl font-semibold">
          {lectureStatus === "ended" ? "Class has ended." : "Class was cancelled."}
        </h2>
        <p className="mt-2 text-richblack-200">Redirecting in 3 seconds...</p>
      </div>
    )
  }

  if (lectureStatus !== "live") {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-content-center bg-richblack-900 text-center text-richblack-5">
        <h2 className="text-2xl font-semibold">Class hasn't started yet. Please wait...</h2>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-richblack-900 text-richblack-5">
      <div
        ref={sharedAreaRef}
        className={`mx-auto flex flex-col gap-4 xl:flex-row ${
          isFullscreen
            ? "h-screen w-full max-w-none p-4"
            : "w-11/12 max-w-350 py-4"
        }`}
      >
        <div
          ref={studentStageRef}
          className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-richblack-700 bg-richblack-800 p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-richblack-25">Live Class</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-richblack-300">Room: {roomId || "N/A"}</p>
            </div>
          </div>

          <div className="absolute right-3 top-3 z-40 flex items-center gap-2 rounded-lg border border-richblack-600 bg-richblack-900/90 p-2 backdrop-blur">
            <button
              type="button"
              onClick={() => setIsChatOpen((prev) => !prev)}
              className="rounded-md bg-richblack-700 px-3 py-2 text-xs"
            >
              {isChatOpen ? "Hide Chat" : "Show Chat"}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-md bg-richblack-700 p-2"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              type="button"
              onClick={handleLeaveClass}
              className="inline-flex items-center gap-1 rounded-md bg-pink-400 px-3 py-1 text-xs font-semibold text-richblack-900"
            >
              <PhoneOff size={14} />
              Leave
            </button>
          </div>

          <div
            className={`relative grid place-items-center rounded-lg border border-richblack-700 bg-richblack-900 ${stageHeightClass}`}
          >
            <video
              ref={mainVideoRef}
              autoPlay
              playsInline
              className="h-full w-full rounded-lg object-contain"
            />
            {!mainStreamRef.current.getVideoTracks().length && (
              <p className="absolute top-3 rounded-md bg-richblack-800/80 px-3 py-1 text-xs text-richblack-200">
                Waiting for instructor stream...
              </p>
            )}
          </div>

          <div
            className="absolute z-20 h-24 w-36 overflow-hidden rounded-lg border border-yellow-100/60 bg-richblack-900 shadow-lg sm:h-36 sm:w-60"
            style={
              instructorPipPosition
                ? { left: `${instructorPipPosition.x}px`, top: `${instructorPipPosition.y}px` }
                : { right: "1.5rem", top: "4rem" }
            }
          >
            <video
              ref={instructorCameraRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-30">
            <div className="pointer-events-auto flex w-fit items-center gap-2 rounded-lg border border-richblack-600 bg-richblack-900/90 p-2 backdrop-blur">
              <button
                onClick={handleMicButton}
                className="yellowButton inline-flex items-center gap-2"
                type="button"
              >
                {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                {!canUseMic ? "Request Unmute" : isMicEnabled ? "Mute Myself" : "Unmute Myself"}
              </button>
            </div>
          </div>
        </div>

        {isChatOpen && (
          <aside
            className={`flex w-full flex-col gap-4 ${
              isFullscreen ? "xl:w-88 xl:min-w-80" : "xl:w-90"
            }`}
          >
          <div
            className={`flex flex-1 flex-col rounded-xl border border-richblack-700 bg-richblack-800 p-4 ${
              isFullscreen ? "min-h-0" : "min-h-90"
            }`}
          >
            <h3 className="mb-3 text-base font-semibold">Live Chat</h3>

            <div className="mb-3 flex-1 space-y-2 overflow-y-auto rounded-md border border-richblack-700 bg-richblack-900 p-3">
              {chatMessages.length === 0 && (
                <p className="text-sm text-richblack-300">No messages yet.</p>
              )}

              {chatMessages.map((message, index) => {
                const isOwnMessage = String(message.userId) === String(userId)
                return (
                <div
                  key={`${message.at}-${index}`}
                  className={`max-w-[85%] rounded-md px-3 py-2 ${
                    isOwnMessage
                      ? "ml-auto bg-yellow-100 text-richblack-900"
                      : "mr-auto bg-richblack-700 text-richblack-5"
                  }`}
                >
                  <p className={`text-xs ${isOwnMessage ? "text-richblack-700" : "text-richblack-200"}`}>
                    {message.name || message.userId || "User"} · {formatTime(message.at)}
                  </p>
                  {!!message.text && (
                    <p className={`text-sm ${isOwnMessage ? "text-richblack-900" : "text-richblack-5"}`}>
                      {message.text}
                    </p>
                  )}
                  {!!message.mediaUrl && message.mediaType === "image" && (
                    <img src={message.mediaUrl} alt="chat-media" className="mt-2 max-h-56 w-full rounded object-contain" />
                  )}
                  {!!message.mediaUrl && message.mediaType === "video" && (
                    <video src={message.mediaUrl} controls className="mt-2 max-h-56 w-full rounded object-contain" />
                  )}
                </div>
              )})}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleAttachChatMedia}
              />
              <button
                type="button"
                disabled={chatUploadLoading}
                onClick={() => fileInputRef.current?.click()}
                className="blackButton inline-flex items-center justify-center px-3"
              >
                <Paperclip size={16} />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendChatMessage()
                  }
                }}
                className="form-style flex-1"
                placeholder="Type a message"
              />
              <button
                type="button"
                onClick={sendChatMessage}
                className="yellowButton inline-flex items-center justify-center px-3"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </aside>
        )}
      </div>
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
    </div>
  )
}
