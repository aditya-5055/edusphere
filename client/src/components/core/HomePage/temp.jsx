
import React from "react";
import TimeLineImage from "../../../assets/Images/TimelineImage.png";
import Logo1 from "../../../assets/TimeLineLogo/Logo1.svg";
import Logo2 from "../../../assets/TimeLineLogo/Logo2.svg";
import Logo3 from "../../../assets/TimeLineLogo/Logo3.svg";
import Logo4 from "../../../assets/TimeLineLogo/Logo4.svg";

const TimeLine = [
  {
    Logo: Logo1,
    Heading: "Leadership",
    Description: "Fully committed to the success company",
  },
  {
    Logo: Logo2,
    Heading: "Responsibility",
    Description: "Students will always be our top priority",
  },
  {
    Logo: Logo3,
    Heading: "Flexibility",
    Description: "The ability to switch is an important skill",
  },
  {
    Logo: Logo4,
    Heading: "Solve the problem",
    Description: "Code your way to a solution",
  },
];

const TimelineSection = () => {
  return (
    <div className="mb-20">
      <div className="flex flex-col lg:flex-row gap-20 items-center">
        {/* LEFT TIMELINE */}
       <div className="lg:w-[45%] flex flex-col gap-14 lg:gap-3">
          {TimeLine.map((ele, i) => {
            return (
              <div className="flex flex-col lg:gap-3" key={i}>
                <div className="flex gap-6" key={i}>
                  <div className="w-[52px] h-[52px] bg-white rounded-full flex justify-center items-center shadow-[#00000012] shadow-[0_0_62px_0]">
                    <img src={ele.Logo} alt="" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[18px]">{ele.Heading}</h2>
                    <p className="text-base">{ele.Description}</p>
                  </div>
                </div>
                <div
                  className={`hidden ${
                    TimeLine.length - 1 === i ? "hidden" : "lg:block"
                  }  h-14 border-dotted border-r border-richblack-100 bg-richblack-400/0 w-[26px]`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative w-fit rounded-lg">
          {/* IMAGE */}
          <img
            src={TimeLineImage}
            alt="timeline"
              className="shadow-white shadow-[20px_20px_0px_0px] object-cover h-[300px] lg:h-fit"
          />

          {/* STATS CARD */}
          <div
            className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-[50%]
                       bg-caribbeangreen-700 rounded-md shadow-lg
                       flex flex-col lg:flex-row
                       text-white uppercase
                       px-6 py-4 lg:px-10 lg:py-6 gap-6"
          >
            {/* STAT 1 */}
            <div className="flex items-center gap-4 lg:border-r border-caribbeangreen-300 pr-6">
              <h1 className="text-3xl font-bold leading-none">10</h1>
              <p className="text-caribbeangreen-300 text-xs tracking-wide">
                Years Experience
              </p>
            </div>

            {/* STAT 2 */}
            <div className="flex items-center gap-4 pl-2">
              <h1 className="text-3xl font-bold leading-none">250</h1>
              <p className="text-caribbeangreen-300 text-xs tracking-wide">
                Types of Courses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSection;
