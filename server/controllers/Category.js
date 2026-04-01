const Category = require("../models/Category")

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      })
    }

    // Check duplicate category
    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      })
    }

    await Category.create({ name, description })

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.showAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}, { name: 1, description: 1 })
      .sort({ name: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      data: categories,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec()

    // console.log("SELECTED COURSE", selectedCategory)
    // Handle the case when the category is not found
    if (!selectedCategory) {
      // console.log("Category not found.")
      return res
        .status(404)
        .json({ success: false, message: "Category not found" })
    }

    // so i change this because my logic is if 0 course so it show no course but here babbar logic is to give 404 error
    
    // Handle the case when there are no courses
    // if (selectedCategory.courses.length === 0) {
    //   // console.log("No courses found for the selected category.")
    //   return res.status(404).json({
    //     success: false,
    //     message: "No courses found for the selected category.",
    //   })
    // }
    if (selectedCategory.courses.length === 0) {
  return res.status(200).json({
    success: true,
    data: {
      selectedCategory,
      differentCategory: null,
      mostSellingCourses: [],
    },
    message: "No courses found for this category",
  })
}


    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
    // console.log()
    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
    const allCourses = allCategories.flatMap((category) => category.courses)
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}