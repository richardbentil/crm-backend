/* const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Content = require('../models/Content');
const aiContentService = require('../services/aiContentService');

// @desc    Get all contents
// @route   GET /api/content
// @access  Private
exports.getContents = asyncHandler(async (req, res, next) => {
  const contents = await Content.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: contents.length,
    data: contents
  });
});

// @desc    Get single content
// @route   GET /api/content/:id
// @access  Private
exports.getContent = asyncHandler(async (req, res, next) => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the content
  if (content.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to access this content`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: content
  });
});

// @desc    Create new content
// @route   POST /api/content
// @access  Private
exports.createContent = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const content = await Content.create(req.body);

  res.status(201).json({
    success: true,
    data: content
  });
});

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private
exports.updateContent = asyncHandler(async (req, res, next) => {
  let content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the content
  if (content.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to update this content`, 401)
    );
  }

  content = await Content.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: content
  });
});

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private
exports.deleteContent = asyncHandler(async (req, res, next) => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    return next(
      new ErrorResponse(`Content not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the content
  if (content.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to delete this content`, 401)
    );
  }

  await content.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Generate AI content
// @route   POST /api/content/generate
// @access  Private
exports.generateAIContent = asyncHandler(async (req, res, next) => {
  const { prompt, contentType } = req.body;

  if (!prompt || !contentType) {
    return next(new ErrorResponse('Please provide a prompt and content type', 400));
  }

  const generatedContent = await aiContentService.generateContent(prompt, contentType);

  res.status(200).json({
    success: true,
    data: generatedContent
  });
});

// @desc    Optimize content using AI
// @route   POST /api/content/optimize
// @access  Private
exports.optimizeContent = asyncHandler(async (req, res, next) => {
  const { content, contentType } = req.body;

  if (!content || !contentType) {
    return next(new ErrorResponse('Please provide content and content type', 400));
  }

  const optimizedContent = await aiContentService.optimizeContent(content, contentType);

  res.status(200).json({
    success: true,
    data: optimizedContent
  });
});

 */