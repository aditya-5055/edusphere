
export default function Tab({ tabData, field, setField }) {
  return (
    // Main container for all tabs
    <div
      style={{
        // Bottom inner shadow for UI effect
        boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
      }}
      // Flex row, background, spacing, rounded design
      className="flex bg-richblack-800 p-1 gap-x-1 my-6 rounded-full max-w-max"
    >
      {
        // Loop through each tab object
        tabData.map((tab) => (
          <button
            key={tab.id} // Unique key for React list

            // When button clicked, change selected tab
            onClick={() => setField(tab.type)}

            // Apply different styles if tab is active
            className={`${
              field === tab.type
                ? "bg-richblack-900 text-richblack-5"  // Active tab style
                : "bg-transparent text-richblack-200" // Inactive tab style
            } py-2 px-5 rounded-full transition-all duration-200`}
          >
            {/* Tab name shown on button */}
            {tab?.tabName}
          </button>
        ))
      }
    </div>
  );
}
