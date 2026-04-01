 
// Import createSlice function from Redux Toolkit
// It helps us create state + reducers easily
import { createSlice } from "@reduxjs/toolkit"

// Initial data of this slice (default values when app starts)
const initialState = {
  courseSectionData: [],     // Stores sections/modules of the course
  courseEntireData: [],      // Stores full course details
  completedLectures: [],     // Stores list of lectures user has completed
  totalNoOfLectures: 0,      // Stores total number of lectures in course
}

// Creating a slice named "viewCourse"
const viewCourseSlice = createSlice({
  name: "viewCourse",        // Name of this slice in Redux store
  initialState,              // Default state

  // Reducers = functions used to update state
  reducers: {

    // Set course section data (replace old sections)
    setCourseSectionData: (state, action) => {
      state.courseSectionData = action.payload   // payload = new section data
    },

    // Set full course details
    setEntireCourseData: (state, action) => {
      state.courseEntireData = action.payload    // payload = full course info
    },

    // Set total number of lectures
    setTotalNoOfLectures: (state, action) => {
      state.totalNoOfLectures = action.payload   // payload = lecture count
    },

    // Set completed lectures list (replace whole list)
    setCompletedLectures: (state, action) => {
      state.completedLectures = action.payload   // payload = array of completed lectures
    },

    // Add one more lecture to completed list
    updateCompletedLectures: (state, action) => {
      // Spread operator keeps old lectures and adds new one
      state.completedLectures = [...state.completedLectures, action.payload]
    },
  },
})

// Exporting all reducer functions (actions) to use in components
export const {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
  updateCompletedLectures,
} = viewCourseSlice.actions

// Exporting the reducer to add inside Redux store
export default viewCourseSlice.reducer
