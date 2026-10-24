import { useEffect, useMemo, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { apiConnector } from "../../services/apiConnector"
import { io } from "socket.io-client"
import toast from "react-hot-toast"
import { Bell, Maximize2, Mic, MicOff, Minimize2, Monitor, MonitorOff, MoreHorizontal, PhoneOff, Send, Video, VideoOff, Paperclip } from "lucide-react"

import ConfirmationModal from "../Common/ConfirmationModal"
import { uploadToCloudinary } from "../../utils/cloudinaryUpload"

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

export default function InstructorLiveRoom({ roomId: roomIdProp, lectureId: lectureIdProp }) {
  const { roomId: roomIdParam, lectureId: lectureIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const roomId = roomIdProp || roomIdParam
  const lectureId = lectureIdProp || lectureIdParam || searchParams.get("lectureId")

  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const socketRef = useRef(null)
  const cameraVideoRef = useRef(null)
  const sharedScreenVideoRef = useRef(null)
  const peerConnectionsRef = useRef({})
  const secondaryCameraSendersRef = useRef({})
  const incomingStudentAudioTracksRef = useRef({})
  const relayedAudioSendersRef = useRef({})
  const cameraStreamRef = useRef(null)
  const screenStreamRef = useRef(null)
  const outgoingVideoTrackRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const recordingSegmentsRef = useRef([])
  const recordingSessionActiveRef = useRef(false)
  const finalizeRecordingAfterSegmentStopRef = useRef(false)
  const endClassAfterRecordingStopRef = useRef(false)
  const pendingRecordingBlobRef = useRef(null)
  const recordingAudioContextRef = useRef(null)
  const sharedAreaRef = useRef(null)
  const instructorStageRef = useRef(null)
  const incomingAudioStreamRef = useRef(new MediaStream())
  const hiddenAudioRef = useRef(null)
  const fileInputRef = useRef(null)

  const [students, setStudents] = useState([])
  const [pendingUnmuteRequests, setPendingUnmuteRequests] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [instructorMicEnabled, setInstructorMicEnabled] = useState(true)
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pendingRecordingBlob, setPendingRecordingBlob] = useState(null)
  const [pendingRecordingPreview, setPendingRecordingPreview] = useState(null)
  const [isUploadingRecording, setIsUploadingRecording] = useState(false)
  const [isEndingClass, setIsEndingClass] = useState(false)
  const [isPreparingRecordingForEnd, setIsPreparingRecordingForEnd] = useState(false)
  const isFinalizingEndRef = useRef(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [chatUploadLoading, setChatUploadLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isControlMenuOpen, setIsControlMenuOpen] = useState(false)

  const [pipPosition, setPipPosition] = useState(null)
  const dragStateRef = useRef({ isDragging: false, offsetX: 0, offsetY: 0 })
  const resolvedLectureIdRef = useRef(lectureId || null)

  const userId = useMemo(() => user?._id || user?.id || "instructor", [user])
  const userName = useMemo(() => {
    const first = user?.firstName || ""
    const last = user?.lastName || ""
    const full = `${first} ${last}`.trim()
    return full || user?.email || "Instructor"
  }, [user])

  useEffect(() => {
    if (lectureId) {
      resolvedLectureIdRef.current = lectureId
    }
  }, [lectureId])

  const addStudentIfMissing = (incomingUserId, socketId) => {
    setStudents((prev) => {
      const exists = prev.some((student) => student.socketId === socketId)
      if (exists) return prev

      return [
        ...prev,
        {
          socketId,
          userId: incomingUserId,
          muted: true,
        },
      ]
    })
  }

  const removeStudent = (socketId) => {
    setStudents((prev) => prev.filter((student) => student.socketId !== socketId))
    setPendingUnmuteRequests((prev) => prev.filter((item) => item.socketId !== socketId))

    delete incomingStudentAudioTracksRef.current[socketId]
    Object.values(relayedAudioSendersRef.current).forEach((senderMap) => {
      if (senderMap[socketId]) {
        senderMap[socketId].replaceTrack(null)
        delete senderMap[socketId]
      }
    })
  }

  const createOrGetPeerConnection = (targetSocketId) => {
    if (peerConnectionsRef.current[targetSocketId]) {
      return peerConnectionsRef.current[targetSocketId]
    }

    const pc = new RTCPeerConnection(getRtcConfig())

    pc.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current || !roomId) return

      socketRef.current.emit("ice-candidate", {
        roomId,
        candidate: event.candidate,
        to: targetSocketId,
      })
    }

    pc.ontrack = (event) => {
      if (event.track.kind !== "audio") return

      incomingStudentAudioTracksRef.current[targetSocketId] = event.track
      incomingAudioStreamRef.current.addTrack(event.track)
      if (hiddenAudioRef.current) {
        hiddenAudioRef.current.srcObject = incomingAudioStreamRef.current
      }

      event.track.onended = () => {
        delete incomingStudentAudioTracksRef.current[targetSocketId]
      }

      syncStudentAudioRelay().then(() => renegotiateAllPeers())
    }

    const cameraAudioTrack = cameraStreamRef.current?.getAudioTracks?.()[0]
    const cameraTrack = cameraStreamRef.current?.getVideoTracks?.()[0]
    const videoTrack = outgoingVideoTrackRef.current

    if (videoTrack) {
      pc.addTrack(videoTrack)
    }

    if (cameraAudioTrack) {
      pc.addTrack(cameraAudioTrack)
    }

    const screenTrack = screenStreamRef.current?.getVideoTracks?.()[0]
    if (screenTrack && cameraTrack) {
      secondaryCameraSendersRef.current[targetSocketId] = pc.addTrack(
        cameraTrack,
        cameraStreamRef.current
      )
    }

    peerConnectionsRef.current[targetSocketId] = pc
    return pc
  }

  const syncStudentAudioRelay = async () => {
    const peerEntries = Object.entries(peerConnectionsRef.current)

    for (const [targetSocketId, pc] of peerEntries) {
      if (!relayedAudioSendersRef.current[targetSocketId]) {
        relayedAudioSendersRef.current[targetSocketId] = {}
      }

      const senderMap = relayedAudioSendersRef.current[targetSocketId]

      Object.entries(incomingStudentAudioTracksRef.current).forEach(([sourceSocketId, track]) => {
        if (!track || sourceSocketId === targetSocketId) return

        if (!senderMap[sourceSocketId]) {
          senderMap[sourceSocketId] = pc.addTrack(track)
        }
      })
    }
  }

  const renegotiateAllPeers = async () => {
    if (!socketRef.current || !roomId) return

    const peerEntries = Object.entries(peerConnectionsRef.current)
    for (const [targetSocketId, pc] of peerEntries) {
      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socketRef.current.emit("offer", {
          roomId,
          offer,
          to: targetSocketId,
        })
      } catch {
        // Keep room session alive even if one peer renegotiation fails.
      }
    }
  }

  const syncSecondaryCameraTrackForAllPeers = async () => {
    const cameraTrack = cameraStreamRef.current?.getVideoTracks?.()[0]
    const shouldSendSecondaryCamera = !!(screenStreamRef.current && cameraTrack)
    const peerEntries = Object.entries(peerConnectionsRef.current)

    for (const [targetSocketId, pc] of peerEntries) {
      const existingSender = secondaryCameraSendersRef.current[targetSocketId]

      if (shouldSendSecondaryCamera) {
        if (existingSender) {
          await existingSender.replaceTrack(cameraTrack)
        } else {
          secondaryCameraSendersRef.current[targetSocketId] = pc.addTrack(
            cameraTrack,
            cameraStreamRef.current
          )
        }
      } else if (existingSender) {
        await existingSender.replaceTrack(null)
        delete secondaryCameraSendersRef.current[targetSocketId]
      }
    }
  }

  const replaceVideoTrackForAllPeers = async (newTrack) => {
    outgoingVideoTrackRef.current = newTrack || null

    const peerEntries = Object.entries(peerConnectionsRef.current)
    for (const [, pc] of peerEntries) {
      const sender = pc.getSenders().find((item) => item.track?.kind === "video")

      if (sender) {
        await sender.replaceTrack(newTrack || null)
      } else if (newTrack) {
        pc.addTrack(newTrack)
      }
    }
  }

  const startCamera = async ({ showPermissionErrorToast = false } = {}) => {
    const hadPermissionDeniedBefore = cameraPermissionDenied

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      cameraStreamRef.current = stream
      const cameraTrack = stream.getVideoTracks()[0]
      const micTrack = stream.getAudioTracks()[0]
      setInstructorMicEnabled(!!micTrack?.enabled)

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream
      }

      if (!screenStreamRef.current) {
        await replaceVideoTrackForAllPeers(cameraTrack)
      } else {
        await syncSecondaryCameraTrackForAllPeers()
        await renegotiateAllPeers()
      }

      setCameraEnabled(true)
      setCameraPermissionDenied(false)

      if (showPermissionErrorToast && hadPermissionDeniedBefore) {
        toast.success("Camera enabled")
      }
    } catch (error) {
      setCameraEnabled(false)
      setCameraPermissionDenied(true)

      if (showPermissionErrorToast) {
        const errorName = error?.name || ""
        if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
          toast.error("Camera permission is blocked. Allow camera access in browser site settings.")
        } else if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
          toast.error("No camera device found.")
        } else {
          toast.error("Could not enable camera.")
        }
      }

      try {
        const fallbackAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })
        cameraStreamRef.current = fallbackAudioStream
        const audioTrack = fallbackAudioStream.getAudioTracks()[0]
        setInstructorMicEnabled(!!audioTrack?.enabled)
        if (audioTrack) {
          const peerEntries = Object.values(peerConnectionsRef.current)
          peerEntries.forEach((pc) => {
            const sender = pc.getSenders().find((item) => item.track?.kind === "audio")
            if (sender) {
              sender.replaceTrack(audioTrack)
            } else {
              pc.addTrack(audioTrack, fallbackAudioStream)
            }
          })
        }
      } catch {
        // Ignore fallback failure and keep inline warning only.
      }
    }
  }

  const stopScreenShare = async () => {
    const stream = screenStreamRef.current
    if (!stream) return

    if (recordingSessionActiveRef.current && isRecording) {
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== "inactive") {
        recorder.stop()
      }
      mediaRecorderRef.current = null
      setIsRecording(false)
      toast("Screen share stopped. Recording will resume when you share again.")
      void cleanupRecordingAudioContext()
    }

    stream.getTracks().forEach((track) => track.stop())
    screenStreamRef.current = null
    setIsSharing(false)

    const cameraTrack = cameraStreamRef.current?.getVideoTracks?.()[0]
    if (cameraTrack) {
      if (sharedScreenVideoRef.current) {
        sharedScreenVideoRef.current.srcObject = cameraStreamRef.current
      }
      await replaceVideoTrackForAllPeers(cameraTrack)
      await syncSecondaryCameraTrackForAllPeers()
      await renegotiateAllPeers()
      return
    }

    if (sharedScreenVideoRef.current) {
      sharedScreenVideoRef.current.srcObject = null
    }
    await replaceVideoTrackForAllPeers(null)
    await syncSecondaryCameraTrackForAllPeers()
    await renegotiateAllPeers()
  }

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          cursor: "always",
        },
        audio: true,
      })

      screenStreamRef.current = stream
      setIsSharing(true)

      if (sharedScreenVideoRef.current) {
        sharedScreenVideoRef.current.srcObject = stream
      }

      const track = stream.getVideoTracks()[0]
      track.onended = () => {
        stopScreenShare()
      }

      await replaceVideoTrackForAllPeers(track)
      await syncSecondaryCameraTrackForAllPeers()
      await renegotiateAllPeers()

      if (recordingSessionActiveRef.current && !isRecording) {
        const mixedRecordingStream = await createMixedRecordingStream(stream)
        const recorder = new MediaRecorder(mixedRecordingStream || stream, {
          mimeType: "video/webm",
        })
        recordedChunksRef.current = []
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data)
          }
        }
        recorder.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            recordingSegmentsRef.current.push(
              new Blob(recordedChunksRef.current, { type: "video/webm" })
            )
          }
          recordedChunksRef.current = []
          setIsRecording(false)

          if (finalizeRecordingAfterSegmentStopRef.current) {
            finalizeRecordingAfterSegmentStopRef.current = false
            const mergedBlob = createMergedRecordingBlob()
            setIsPreparingRecordingForEnd(false)

            if (endClassAfterRecordingStopRef.current) {
              endClassAfterRecordingStopRef.current = false
              if (mergedBlob) {
                openSaveRecordingModal()
              } else {
                setIsEndingClass(true)
                void finalizeClassEnd()
              }
              return
            }

            if (mergedBlob) {
              toast.success("Recording is ready. You can save it when ending class.")
            }
          }

          void cleanupRecordingAudioContext()
        }

        mediaRecorderRef.current = recorder
        recorder.start(1000)
        setIsRecording(true)
      }
    } catch {
      setIsSharing(false)
    }
  }

  const toggleCamera = async () => {
    const hasVideoTrack = !!cameraStreamRef.current?.getVideoTracks?.()[0]

    // If camera permission was denied earlier (or we only have audio fallback),
    // retry full camera access instead of returning early.
    if (!cameraStreamRef.current || !hasVideoTrack || cameraPermissionDenied) {
      await startCamera({ showPermissionErrorToast: true })
      return
    }

    const track = cameraStreamRef.current.getVideoTracks()[0]
    if (!track || track.readyState === "ended") {
      await startCamera({ showPermissionErrorToast: true })
      return
    }

    track.enabled = !track.enabled
    setCameraEnabled(track.enabled)
    if (track.enabled) {
      setCameraPermissionDenied(false)
    }
  }

  const closeAllPeerConnections = () => {
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close())
    peerConnectionsRef.current = {}
    secondaryCameraSendersRef.current = {}
    incomingStudentAudioTracksRef.current = {}
    relayedAudioSendersRef.current = {}
  }

  const cleanupRecordingAudioContext = async () => {
    if (recordingAudioContextRef.current) {
      try {
        await recordingAudioContextRef.current.close()
      } catch {
        // Avoid breaking session on audio context cleanup failure.
      }
      recordingAudioContextRef.current = null
    }
  }

  const createMixedRecordingStream = async (screenStream) => {
    if (!screenStream) return null

    const mixedStream = new MediaStream()
    const screenVideoTrack = screenStream.getVideoTracks?.()[0]
    if (screenVideoTrack) {
      mixedStream.addTrack(screenVideoTrack)
    }

    const screenAudioTrack = screenStream.getAudioTracks?.()[0]
    const micAudioTrack = cameraStreamRef.current?.getAudioTracks?.()[0]
    const hasStudentAudio =
      incomingAudioStreamRef.current?.getAudioTracks?.().length > 0

    const hasAudioInput = !!screenAudioTrack || !!micAudioTrack || hasStudentAudio
    if (!hasAudioInput) {
      return mixedStream
    }

    await cleanupRecordingAudioContext()
    const audioContext = new AudioContext()
    recordingAudioContextRef.current = audioContext
    const destination = audioContext.createMediaStreamDestination()

    if (screenAudioTrack) {
      const screenAudioStream = new MediaStream([screenAudioTrack])
      const screenSource = audioContext.createMediaStreamSource(screenAudioStream)
      screenSource.connect(destination)
    }

    if (micAudioTrack) {
      const micAudioStream = new MediaStream([micAudioTrack])
      const micSource = audioContext.createMediaStreamSource(micAudioStream)
      micSource.connect(destination)
    }

    if (hasStudentAudio) {
      const studentSource = audioContext.createMediaStreamSource(
        incomingAudioStreamRef.current
      )
      studentSource.connect(destination)
    }

    const mixedAudioTrack = destination.stream.getAudioTracks?.()[0]
    if (mixedAudioTrack) {
      mixedStream.addTrack(mixedAudioTrack)
    }

    return mixedStream
  }

  const toggleInstructorMic = () => {
    const audioTrack = cameraStreamRef.current?.getAudioTracks?.()[0]
    if (!audioTrack) {
      toast.error("Microphone is not available")
      return
    }

    audioTrack.enabled = !audioTrack.enabled
    setInstructorMicEnabled(audioTrack.enabled)
  }

  const resolveLectureId = async () => {
    if (resolvedLectureIdRef.current) {
      return resolvedLectureIdRef.current
    }

    if (!roomId || !token) {
      return null
    }

    try {
      const response = await apiConnector(
        "GET",
        `${getLiveLectureApiBase()}/room/${roomId}`,
        null,
        { Authorization: `Bearer ${token}` }
      )

      const fetchedLectureId = response?.data?.data?._id
      if (fetchedLectureId) {
        resolvedLectureIdRef.current = fetchedLectureId
        return fetchedLectureId
      }
    } catch {
      // Keep existing flow and fail with explicit message where required.
    }

    return null
  }

  const uploadPendingRecording = async () => {
    const blobToUpload = pendingRecordingBlobRef.current || pendingRecordingBlob
    if (!blobToUpload || !token) {
      toast.error("Recording file is not ready yet. Please try again.")
      return false
    }

    const targetLectureId = await resolveLectureId()
    if (!targetLectureId) {
      toast.error("Could not find lecture to attach recording. Please rejoin the class and try again.")
      return false
    }

    try {
      setIsUploadingRecording(true)
      const uploadRes = await uploadToCloudinary({
        file: blobToUpload,
        folderType: "live-recording",
        resourceType: "video",
        token,
      })

      await apiConnector(
        "POST",
        `${getLiveLectureApiBase()}/${targetLectureId}/upload-recording`,
        { recordingUrl: uploadRes.secure_url },
        {
          Authorization: `Bearer ${token}`,
        }
      )
      toast.success("Recording uploaded to course")
      setPendingRecordingBlob(null)
      pendingRecordingBlobRef.current = null
      recordingSegmentsRef.current = []
      if (pendingRecordingPreview) {
        URL.revokeObjectURL(pendingRecordingPreview)
      }
      setPendingRecordingPreview(null)
      return true
    } catch (error) {
      toast.error(error.message || "Could not upload recording")
      return false
    } finally {
      setIsUploadingRecording(false)
    }
  }

  const openSaveRecordingModal = () => {
    setConfirmationModal({
      text1: "Save this recording to your course?",
      text2: "Choose Yes to upload recording to Cloudinary and attach it to this course. Choose No to end class without saving.",
      btn1Text: isUploadingRecording ? "Uploading..." : "Yes, Save",
      btn2Text: "No, End Class",
      btn1Handler: async () => {
        if (isUploadingRecording || isFinalizingEndRef.current) return
        isFinalizingEndRef.current = true
        setIsEndingClass(true)
        const uploaded = await uploadPendingRecording()
        if (!uploaded) {
          setIsEndingClass(false)
          isFinalizingEndRef.current = false
          return
        }
        setConfirmationModal(null)
        await finalizeClassEnd()
        isFinalizingEndRef.current = false
      },
      btn2Handler: async () => {
        if (isFinalizingEndRef.current) return
        isFinalizingEndRef.current = true
        setIsEndingClass(true)
        setPendingRecordingBlob(null)
        pendingRecordingBlobRef.current = null
        recordingSegmentsRef.current = []
        if (pendingRecordingPreview) {
          URL.revokeObjectURL(pendingRecordingPreview)
        }
        setPendingRecordingPreview(null)
        setConfirmationModal(null)
        await finalizeClassEnd()
        isFinalizingEndRef.current = false
      },
    })
  }

  const createMergedRecordingBlob = () => {
    if (recordingSegmentsRef.current.length === 0) {
      return null
    }

    const mergedBlob = new Blob(recordingSegmentsRef.current, {
      type: "video/webm",
    })

    if (pendingRecordingPreview) {
      URL.revokeObjectURL(pendingRecordingPreview)
    }

    setPendingRecordingBlob(mergedBlob)
    pendingRecordingBlobRef.current = mergedBlob
    setPendingRecordingPreview(URL.createObjectURL(mergedBlob))
    return mergedBlob
  }

  const finalizeClassEnd = async () => {
    setIsEndingClass(true)

    if (!token) {
      navigate("/dashboard/my-courses")
      return
    }

    const targetLectureId = await resolveLectureId()
    if (!targetLectureId) {
      toast.error("Could not resolve class details. Ending from this tab only.")
      navigate("/dashboard/my-courses")
      return
    }

    try {
      const url = `${getLiveLectureApiBase()}/${targetLectureId}/end`
      await apiConnector("PATCH", url, null, {
        Authorization: `Bearer ${token}`,
      })
    } catch {
      // Redirect anyway so class can close from UI side.
    } finally {
      navigate("/dashboard/my-courses")
    }
  }

  const handleEndClass = async () => {
    if (isEndingClass || isPreparingRecordingForEnd) return

    if (isRecording || recordingSessionActiveRef.current) {
      endClassAfterRecordingStopRef.current = true
      setIsPreparingRecordingForEnd(true)
      const { stoppingAsync, mergedBlob } = stopRecording({ suppressToast: true })

      if (stoppingAsync) {
        toast("Finishing recording before ending class...")
        return
      }

      endClassAfterRecordingStopRef.current = false
      setIsPreparingRecordingForEnd(false)
      if (mergedBlob || pendingRecordingBlob) {
        openSaveRecordingModal()
      } else {
        setIsEndingClass(true)
        await finalizeClassEnd()
      }
      return
    }

    if (pendingRecordingBlob) {
      openSaveRecordingModal()
      return
    }

    setIsEndingClass(true)
    await finalizeClassEnd()
  }

  const handleMuteToggle = (studentSocketId, muted) => {
    if (!socketRef.current || !roomId) return

    const eventName = muted ? "unmute-student" : "mute-student"
    socketRef.current.emit(eventName, {
      roomId,
      studentSocketId,
    })

    setStudents((prev) =>
      prev.map((student) =>
        student.socketId === studentSocketId ? { ...student, muted: !muted } : student
      )
    )
  }

  const approveUnmuteRequest = (studentSocketId) => {
    if (!socketRef.current || !roomId || !studentSocketId) return

    socketRef.current.emit("unmute-student", {
      roomId,
      studentSocketId,
    })

    setStudents((prev) =>
      prev.map((student) =>
        student.socketId === studentSocketId ? { ...student, muted: false } : student
      )
    )
    setPendingUnmuteRequests((prev) => prev.filter((item) => item.socketId !== studentSocketId))
  }

  const startRecording = async () => {
    const stream = screenStreamRef.current
    if (recordingSessionActiveRef.current) {
      toast("Recording is already active")
      return
    }

    if (!stream || !stream.getVideoTracks().length) {
      toast.error("Start screen share before recording")
      return
    }

    try {
      recordingSessionActiveRef.current = true
      finalizeRecordingAfterSegmentStopRef.current = false
      recordingSegmentsRef.current = []
      recordedChunksRef.current = []

      const mixedRecordingStream = await createMixedRecordingStream(stream)
      const recorder = new MediaRecorder(mixedRecordingStream || stream, {
        mimeType: "video/webm",
      })

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          recordingSegmentsRef.current.push(
            new Blob(recordedChunksRef.current, { type: "video/webm" })
          )
        }
        recordedChunksRef.current = []
        setIsRecording(false)

        if (finalizeRecordingAfterSegmentStopRef.current) {
          finalizeRecordingAfterSegmentStopRef.current = false
          const mergedBlob = createMergedRecordingBlob()
          setIsPreparingRecordingForEnd(false)

          if (endClassAfterRecordingStopRef.current) {
            endClassAfterRecordingStopRef.current = false
            if (mergedBlob) {
              openSaveRecordingModal()
            } else {
              setIsEndingClass(true)
              void finalizeClassEnd()
            }
            return
          }

          if (mergedBlob) {
            toast.success("Recording is ready. You can save it when ending class.")
          }
        }

        void cleanupRecordingAudioContext()
      }

      recorder.start(1000)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      toast.success("Recording started")
    } catch {
      recordingSessionActiveRef.current = false
      toast.error("Recording could not start")
      setIsRecording(false)
    }
  }

  const stopRecording = ({ suppressToast = false } = {}) => {
    if (!recordingSessionActiveRef.current) {
      return { stoppingAsync: false, mergedBlob: null }
    }

    recordingSessionActiveRef.current = false

    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      finalizeRecordingAfterSegmentStopRef.current = true
      recorder.stop()
      mediaRecorderRef.current = null

      if (!suppressToast) {
        toast.success("Recording stopped")
      }
      return { stoppingAsync: true, mergedBlob: null }
    }

    const mergedBlob = createMergedRecordingBlob()
    if (mergedBlob && !suppressToast) {
      toast.success("Recording is ready. You can save it when ending class.")
    }

    return { stoppingAsync: false, mergedBlob }
  }

  const sendChatMessage = () => {
    const trimmed = chatInput.trim()
    if (!trimmed || !socketRef.current || !roomId) return

    const payload = {
      roomId,
      text: trimmed,
      userId,
      name: userName,
      role: "instructor",
      at: new Date().toISOString(),
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
        role: "instructor",
      }

      socketRef.current.emit("chat-message", payload)
      setChatMessages((prev) => [...prev, payload])
    } catch (error) {
      toast.error(error.message || "Failed to upload media")
    } finally {
      setChatUploadLoading(false)
      if (chatFileInputRef.current) {
        chatFileInputRef.current.value = ""
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

  const beginDrag = (event) => {
    const element = event.currentTarget
    const rect = element.getBoundingClientRect()

    if (!pipPosition) {
      setPipPosition({ x: rect.left, y: rect.top })
    }

    dragStateRef.current = {
      isDragging: true,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    }
  }

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!dragStateRef.current.isDragging) return

      const width = 256
      const height = 160
      const stageRect = instructorStageRef.current?.getBoundingClientRect()

      if (!stageRect) return

      const maxX = Math.max(0, stageRect.width - width)
      const maxY = Math.max(0, stageRect.height - height)
      const newX = Math.max(
        0,
        Math.min(maxX, event.clientX - stageRect.left - dragStateRef.current.offsetX)
      )
      const newY = Math.max(
        0,
        Math.min(maxY, event.clientY - stageRect.top - dragStateRef.current.offsetY)
      )
      setPipPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      dragStateRef.current.isDragging = false
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  useEffect(() => {
    if (!pipPosition || !socketRef.current || !roomId) return

    const width = 256
    const height = 160
    const stageRect = instructorStageRef.current?.getBoundingClientRect()
    if (!stageRect) return

    const maxX = Math.max(1, stageRect.width - width)
    const maxY = Math.max(1, stageRect.height - height)

    socketRef.current.emit("pip-position-update", {
      roomId,
      xRatio: Math.min(1, Math.max(0, pipPosition.x / maxX)),
      yRatio: Math.min(1, Math.max(0, pipPosition.y / maxY)),
    })
  }, [pipPosition, roomId])

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      if (!document.fullscreenElement) {
        setIsControlMenuOpen(false)
      }
    }

    document.addEventListener("fullscreenchange", onFullScreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange)
    }
  }, [])

  useEffect(() => {
    if (!roomId) return

    let active = true

    const initialize = async () => {
      await startCamera({ showPermissionErrorToast: false })

      if (!active) return

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
          role: "instructor",
        })
      })

      socket.on("connect_error", () => {
        toast.error("Live connection issue. Reconnecting...")
      })

      socket.on("user-joined", async ({ userId: joinedUserId, role, name, socketId }) => {
        if (!socketId || role !== "student") return

        addStudentIfMissing(name || joinedUserId, socketId)

        const pc = createOrGetPeerConnection(socketId)
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        socket.emit("offer", {
          roomId,
          offer,
          to: socketId,
        })
      })

      socket.on("offer", async ({ offer, from, userId: joinedUserId, name }) => {
        if (!from || !offer) return

        addStudentIfMissing(name || joinedUserId, from)

        const pc = createOrGetPeerConnection(from)
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        socket.emit("answer", {
          roomId,
          answer,
          to: from,
        })
      })

      socket.on("answer", async ({ answer, from }) => {
        if (!from || !answer) return

        const pc = peerConnectionsRef.current[from]
        if (!pc) return

        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      })

      socket.on("ice-candidate", async ({ candidate, from }) => {
        if (!from || !candidate) return

        const pc = peerConnectionsRef.current[from]
        if (!pc) return

        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      })

      socket.on("user-left", ({ socketId }) => {
        if (!socketId) return

        const pc = peerConnectionsRef.current[socketId]
        if (pc) {
          pc.close()
          delete peerConnectionsRef.current[socketId]
        }

        removeStudent(socketId)
      })

      socket.on("chat-message", (payload) => {
        if (!payload?.text && !payload?.mediaUrl) return
        setChatMessages((prev) => [...prev, payload])
      })

      socket.on("room-participants", ({ participants }) => {
        const studentParticipants = (participants || []).filter(
          (participant) => participant.role === "student"
        )

        setStudents((prev) => {
          const muteStateBySocket = new Map(
            prev.map((student) => [student.socketId, student.muted])
          )

          return studentParticipants.map((participant) => ({
            socketId: participant.socketId,
            userId: participant.name || participant.userId,
            muted: muteStateBySocket.get(participant.socketId) ?? true,
          }))
        })

        studentParticipants.forEach(async (participant) => {
          const targetSocketId = participant.socketId
          if (!targetSocketId || targetSocketId === socket.id) return

          const existingPc = peerConnectionsRef.current[targetSocketId]
          const hasRemoteDescription = !!existingPc?.remoteDescription
          if (existingPc && hasRemoteDescription) return

          try {
            const pc = createOrGetPeerConnection(targetSocketId)
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            socket.emit("offer", {
              roomId,
              offer,
              to: targetSocketId,
            })
          } catch {
            // Keep other peers connected even if one offer cycle fails.
          }
        })
      })

      socket.on("unmute-request", ({ userId: requestUserId, name, socketId }) => {
        if (!socketId) return

        const displayName = name || requestUserId || "Student"
        addStudentIfMissing(displayName, socketId)
        setPendingUnmuteRequests((prev) => {
          if (prev.some((item) => item.socketId === socketId)) {
            return prev
          }
          return [...prev, { socketId, name: displayName }]
        })
      })
    }

    initialize()

    return () => {
      active = false

      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }

      closeAllPeerConnections()

      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop())
        cameraStreamRef.current = null
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
        screenStreamRef.current = null
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      void cleanupRecordingAudioContext()
      mediaRecorderRef.current = null
      recordedChunksRef.current = []
      setIsRecording(false)

      if (pendingRecordingPreview) {
        URL.revokeObjectURL(pendingRecordingPreview)
      }

      if (hiddenAudioRef.current) {
        hiddenAudioRef.current.srcObject = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, userName])

  useEffect(() => {
    if (!sharedScreenVideoRef.current) return

    if (screenStreamRef.current) {
      sharedScreenVideoRef.current.srcObject = screenStreamRef.current
    } else if (cameraStreamRef.current) {
      sharedScreenVideoRef.current.srcObject = cameraStreamRef.current
    }
  }, [isSharing])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-richblack-900 text-richblack-5">
      <div
        ref={sharedAreaRef}
        className="mx-auto flex w-11/12 max-w-350 flex-col gap-4 py-4 xl:flex-row"
      >
        <div
          ref={instructorStageRef}
          className="relative flex-1 overflow-hidden rounded-xl border border-richblack-700 bg-richblack-800 p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-richblack-25">Instructor Live Room</h2>
            <div className="flex items-center gap-3">
              {isRecording && (
                <div className="inline-flex items-center gap-2 rounded-md bg-pink-300/20 px-2 py-1 text-xs font-semibold text-pink-100">
                  <span className="h-2 w-2 rounded-full bg-pink-200" />
                  REC
                </div>
              )}
              <p className="text-xs text-richblack-300">Room: {roomId || "N/A"}</p>
            </div>
          </div>

          <div className="absolute right-3 top-3 z-40 flex items-center gap-2 rounded-lg border border-richblack-600 bg-richblack-900/90 p-2 backdrop-blur">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="rounded-md bg-richblack-700 px-3 py-2 text-xs"
            >
              {isSidebarOpen ? "Hide Panel" : "Show Panel"}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-md bg-richblack-700 p-2"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          <div className="relative grid h-[55vh] place-items-center rounded-lg border border-richblack-700 bg-richblack-900 md:h-[65vh] xl:h-[70vh]">
            <video
              ref={sharedScreenVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full rounded-lg object-contain"
            />
            {!isSharing && (
              <p className="absolute top-3 rounded-md bg-richblack-800/80 px-3 py-1 text-xs text-richblack-200">
                Screen share is off. Camera feed is shown in main area.
              </p>
            )}
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-30 space-y-2">
            {cameraPermissionDenied && (
              <div className="pointer-events-auto rounded-md border border-yellow-100/40 bg-yellow-100/10 px-3 py-2 text-xs text-yellow-25">
                Camera permission is blocked. Allow camera access in browser site settings to enable instructor video.
              </div>
            )}
            {isSharing && screenStreamRef.current?.getVideoTracks?.()[0]?.label?.toLowerCase?.().includes("tab") && (
              <div className="pointer-events-auto rounded-md border border-pink-200/40 bg-pink-200/10 px-3 py-2 text-xs text-pink-100">
                You are sharing a browser tab containing this page, which creates mirror replicas. Share your full screen or another window for a professional lecture view.
              </div>
            )}
            {pendingRecordingBlob && (
              <div className="pointer-events-auto rounded-md border border-green-200/40 bg-green-200/10 px-3 py-2 text-xs text-green-25">
                Recording captured and ready to publish. You will be asked to save it when ending class.
              </div>
            )}

            {!isFullscreen ? (
              <div className="pointer-events-auto flex flex-wrap gap-3 rounded-lg border border-richblack-600 bg-richblack-900/90 p-3 backdrop-blur">
                <button
                  onClick={startScreenShare}
                  className="yellowButton inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  disabled={isSharing}
                >
                  <Monitor size={16} />
                  Share Screen
                </button>

                <button
                  onClick={stopScreenShare}
                  className="blackButton inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  disabled={!isSharing}
                >
                  <MonitorOff size={16} />
                  Stop Share
                </button>

                <button
                  onClick={toggleCamera}
                  className="blackButton inline-flex items-center gap-2"
                  type="button"
                >
                  {cameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}
                  {!cameraStreamRef.current || cameraPermissionDenied
                    ? "Enable Camera"
                    : "Toggle Camera"}
                </button>

                <button
                  onClick={toggleInstructorMic}
                  className="blackButton inline-flex items-center gap-2"
                  type="button"
                >
                  {instructorMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                  {instructorMicEnabled ? "Mute Mic" : "Unmute Mic"}
                </button>

                <button
                  onClick={startRecording}
                  className="blackButton inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  disabled={!isSharing || isRecording}
                >
                  Start Recording
                </button>

                <button
                  onClick={stopRecording}
                  className="blackButton inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  disabled={!isRecording}
                >
                  Stop Recording
                </button>

                <button
                  onClick={handleEndClass}
                  className="inline-flex items-center gap-2 rounded-md bg-pink-400 px-5 py-2 font-semibold text-richblack-900 disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  disabled={isEndingClass || isPreparingRecordingForEnd}
                >
                  <PhoneOff size={16} />
                  {isEndingClass
                    ? "Ending..."
                    : isPreparingRecordingForEnd
                    ? "Preparing..."
                    : "End Class"}
                </button>
              </div>
            ) : (
              <div className="pointer-events-auto relative flex items-center justify-between gap-2 rounded-lg border border-richblack-600 bg-richblack-900/90 p-2 backdrop-blur">
                <div className="flex items-center gap-2">
                  <button
                    onClick={startScreenShare}
                    className="yellowButton inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    disabled={isSharing}
                  >
                    <Monitor size={16} />
                    Share
                  </button>
                  <button
                    onClick={stopScreenShare}
                    className="blackButton inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    disabled={!isSharing}
                  >
                    <MonitorOff size={16} />
                    Stop
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsControlMenuOpen((prev) => !prev)}
                    className="rounded-md bg-richblack-700 p-2"
                    title="More Controls"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  <button
                    onClick={handleEndClass}
                    className="inline-flex items-center gap-2 rounded-md bg-pink-400 px-4 py-2 text-sm font-semibold text-richblack-900 disabled:cursor-not-allowed disabled:opacity-70"
                    type="button"
                    disabled={isEndingClass || isPreparingRecordingForEnd}
                  >
                    <PhoneOff size={16} />
                    {isEndingClass
                      ? "Ending..."
                      : isPreparingRecordingForEnd
                      ? "Preparing..."
                      : "End"}
                  </button>
                </div>

                {isControlMenuOpen && (
                  <div className="absolute bottom-14 right-2 z-50 min-w-55 rounded-md border border-richblack-600 bg-richblack-800 p-2 shadow-xl">
                    <button
                      onClick={toggleCamera}
                      className="mb-2 flex w-full items-center gap-2 rounded-md bg-richblack-700 px-3 py-2 text-sm"
                      type="button"
                    >
                      {cameraEnabled ? <Video size={15} /> : <VideoOff size={15} />}
                      {!cameraStreamRef.current || cameraPermissionDenied ? "Enable Camera" : "Toggle Camera"}
                    </button>
                    <button
                      onClick={toggleInstructorMic}
                      className="mb-2 flex w-full items-center gap-2 rounded-md bg-richblack-700 px-3 py-2 text-sm"
                      type="button"
                    >
                      {instructorMicEnabled ? <Mic size={15} /> : <MicOff size={15} />}
                      {instructorMicEnabled ? "Mute Mic" : "Unmute Mic"}
                    </button>
                    <button
                      onClick={startRecording}
                      className="mb-2 flex w-full items-center gap-2 rounded-md bg-richblack-700 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={!isSharing || isRecording}
                    >
                      Start Recording
                    </button>
                    <button
                      onClick={stopRecording}
                      className="flex w-full items-center gap-2 rounded-md bg-richblack-700 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={!isRecording}
                    >
                      Stop Recording
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            onMouseDown={beginDrag}
            role="presentation"
            className="absolute z-20 h-28 w-44 cursor-move overflow-hidden rounded-lg border border-yellow-100/50 bg-richblack-900 shadow-lg sm:h-40 sm:w-64"
            style={
              pipPosition
                ? { left: `${pipPosition.x}px`, top: `${pipPosition.y}px` }
                : { right: "1rem", bottom: "1rem" }
            }
          >
            <video
              ref={cameraVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            {!cameraEnabled && (
              <div className="absolute inset-0 grid place-items-center bg-richblack-900/85 text-center text-xs text-richblack-100">
                Camera is off
              </div>
            )}
          </div>
        </div>

        {isSidebarOpen && (
          <aside className="flex w-full flex-col gap-4 xl:w-90">
          <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4">
            <h3 className="mb-3 flex items-center justify-between text-base font-semibold">
              <span>Connected Students ({students.length})</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-richblack-700 px-2 py-1 text-xs text-yellow-25">
                <Bell size={12} /> {pendingUnmuteRequests.length}
              </span>
            </h3>

            {pendingUnmuteRequests.length > 0 && (
              <div className="mb-3 space-y-2 rounded-md border border-yellow-100/30 bg-yellow-100/10 p-2">
                {pendingUnmuteRequests.map((request) => (
                  <div key={request.socketId} className="flex items-center justify-between gap-2">
                    <p className="text-xs text-yellow-25">{request.name} requested mic access</p>
                    <button
                      type="button"
                      onClick={() => approveUnmuteRequest(request.socketId)}
                      className="rounded bg-yellow-50 px-2 py-1 text-xs font-semibold text-richblack-900"
                    >
                      Allow
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {students.length === 0 && (
                <p className="text-sm text-richblack-300">No students joined yet.</p>
              )}

              {students.map((student) => (
                <div
                  key={student.socketId}
                  className="flex items-center justify-between rounded-md border border-richblack-600 bg-richblack-700 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{student.userId || "Student"}</p>
                    <p className="text-xs text-richblack-300">{student.socketId}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMuteToggle(student.socketId, student.muted)}
                    className="rounded-full bg-richblack-900 p-2 text-richblack-25 hover:bg-richblack-600"
                    title={student.muted ? "Unmute student" : "Mute student"}
                  >
                    {student.muted ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-90 flex-1 flex-col rounded-xl border border-richblack-700 bg-richblack-800 p-4">
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
                    {message.name || "User"}
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
      <audio ref={hiddenAudioRef} autoPlay playsInline className="hidden" />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}
