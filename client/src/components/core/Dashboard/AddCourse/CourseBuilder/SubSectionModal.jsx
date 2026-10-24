import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";

import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";
import { uploadToCloudinary } from "../../../../../utils/cloudinaryUpload";
import IconBtn from "../../../../Common/IconBtn";
import Upload from "../Upload";

export default function SubSectionModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm();

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title);
      setValue("lectureDesc", modalData.description);
      setValue("lectureVideo", modalData.videoUrl);
    }
  }, []);

  const isFormUpdated = () => {
    const currentValues = getValues();
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
    ) {
      return true;
    }
    return false;
  };

  const handleEditSubsection = async () => {
    const currentValues = getValues();
    setLoading(true);

    try {
      let videoUrl = modalData.videoUrl;
      let timeDuration = modalData.timeDuration || "0";

      if (currentValues.lectureVideo !== modalData.videoUrl) {
        if (currentValues.lectureVideo instanceof File) {
          const uploadRes = await uploadToCloudinary({
            file: currentValues.lectureVideo,
            folderType: "course-video",
            resourceType: "video",
            token,
          });
          videoUrl = uploadRes.secure_url;
          timeDuration = `${uploadRes.duration || "0"}`;
        } else if (typeof currentValues.lectureVideo === "string") {
          videoUrl = currentValues.lectureVideo;
        }
      }

      const payload = {
        sectionId: modalData.sectionId,
        subSectionId: modalData._id,
        title: currentValues.lectureTitle,
        description: currentValues.lectureDesc,
        videoUrl,
        timeDuration,
      };

      const result = await updateSubSection(payload, token);
      if (result) {
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData.sectionId ? result : section,
        );
        const updatedCourse = { ...course, courseContent: updatedCourseContent };
        dispatch(setCourse(updatedCourse));
      }
      setModalData(null);
    } catch (error) {
      toast.error(error.message || "Failed to update lecture");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (view) return;

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form");
      } else {
        handleEditSubsection();
      }
      return;
    }

    setLoading(true);
    try {
      let videoUrl = "";
      let timeDuration = "0";

      if (data.lectureVideo instanceof File) {
        const uploadRes = await uploadToCloudinary({
          file: data.lectureVideo,
          folderType: "course-video",
          resourceType: "video",
          token,
        });
        videoUrl = uploadRes.secure_url;
        timeDuration = `${uploadRes.duration || "0"}`;
      } else if (typeof data.lectureVideo === "string") {
        videoUrl = data.lectureVideo;
      }

      if (!videoUrl) {
        toast.error("Video upload failed");
        setLoading(false);
        return;
      }

      const payload = {
        sectionId: modalData,
        title: data.lectureTitle,
        description: data.lectureDesc,
        videoUrl,
        timeDuration,
      };

      const result = await createSubSection(payload, token);
      if (result) {
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData ? result : section,
        );
        const updatedCourse = { ...course, courseContent: updatedCourseContent };
        dispatch(setCourse(updatedCourse));
      }
      setModalData(null);
    } catch (error) {
      toast.error(error.message || "Failed to create lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-black/50 backdrop-blur-md">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5 hover:text-red-500 transition-colors duration-200" />
          </button>
        </div>
        {/* Modal Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 px-8 py-10"
        >
          {/* Lecture Video Upload */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData.videoUrl : null}
            editData={edit ? modalData.videoUrl : null}
          />
          {/* Lecture Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
              Lecture Title {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })}
              className="form-style w-full"
            />
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture title is required
              </span>
            )}
          </div>
          {/* Lecture Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
              Lecture Description{" "}
              {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc", { required: true })}
              className="form-style resize-x-none min-h-[130px] w-full"
            />
            {errors.lectureDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture Description is required
              </span>
            )}
          </div>
          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? "Loading.." : edit ? "Save Changes" : "Save"}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}