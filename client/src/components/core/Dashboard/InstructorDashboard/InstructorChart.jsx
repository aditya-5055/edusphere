
import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Pie } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  // State to keep track of the currently selected chart
  const [currChart, setCurrChart] = useState("students")

  // Function to generate random colors for the chart
  const generateRandomColors = (numColors) => {
    const colors = []
    for (let i = 0; i < numColors; i++) {
      const color = `hsl(${Math.random() * 360}, 70%, 60%)`
      colors.push(color)
    }
    return colors
  }

  // Data for the chart displaying student information
  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: generateRandomColors(courses.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }

  // Data for the chart displaying income information
  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: generateRandomColors(courses.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }

  // Options for the chart
  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#e0e0e0',
          font: {
            size: 12,
            weight: '500',
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fbbf24',
        bodyColor: '#e0e0e0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
      },
    },
  }

  return (
    <div className="flex-1 rounded-xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-6 shadow-xl border border-richblack-700">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
          Analytics Dashboard
        </p>
        <div className="flex gap-3">
          {/* Button to switch to the "students" chart */}
          <button
            onClick={() => setCurrChart("students")}
            className={`relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 overflow-hidden group ${
              currChart === "students"
                ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-richblack-900 shadow-lg shadow-yellow-500/30"
                : "bg-richblack-700 text-yellow-400 hover:bg-richblack-600"
            }`}
          >
            <span className="relative z-10">Students</span>
            {currChart === "students" && (
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
          </button>
          {/* Button to switch to the "income" chart */}
          <button
            onClick={() => setCurrChart("income")}
            className={`relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 overflow-hidden group ${
              currChart === "income"
                ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-richblack-900 shadow-lg shadow-yellow-500/30"
                : "bg-richblack-700 text-yellow-400 hover:bg-richblack-600"
            }`}
          >
            <span className="relative z-10">Income</span>
            {currChart === "income" && (
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
          </button>
        </div>
      </div>
      
      <div className="relative mx-auto h-[300px] w-full md:h-[350px] transition-all duration-500 ease-in-out">
        {/* Render the Pie chart based on the selected chart */}
        <Pie
          data={currChart === "students" ? chartDataStudents : chartIncomeData}
          options={options}
        />
      </div>
      
      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-richblack-700/50 p-4 border border-richblack-600">
          <p className="text-sm text-richblack-300">Total {currChart === "students" ? "Students" : "Income"}</p>
          <p className="text-2xl font-bold text-yellow-400">
            {currChart === "students" 
              ? courses.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0)
              : `₹${courses.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0).toLocaleString()}`
            }
          </p>
        </div>
        <div className="rounded-lg bg-richblack-700/50 p-4 border border-richblack-600">
          <p className="text-sm text-richblack-300">Courses</p>
          <p className="text-2xl font-bold text-yellow-400">{courses.length}</p>
        </div>
      </div>
    </div>
  )
}