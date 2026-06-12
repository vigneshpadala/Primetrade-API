const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * GET /tasks — Get tasks with filters, pagination, sorting
 */
const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      sortBy = 'createdAt',
      order = 'desc',
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter — admins see all, users see their own
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.$text = { $search: search };

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('owner', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Tasks fetched', tasks, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /tasks/:id — Get single task
 */
const getTask = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.owner = req.user._id;

    const task = await Task.findOne(filter).populate('owner', 'name email');
    if (!task) return sendError(res, 404, 'Task not found');

    return sendSuccess(res, 200, 'Task fetched', task);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /tasks — Create task
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      owner: req.user._id,
    });

    await task.populate('owner', 'name email');

    logger.info(`Task created: "${title}" by user ${req.user.email}`);
    return sendSuccess(res, 201, 'Task created successfully', task);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /tasks/:id — Update task
 */
const updateTask = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.owner = req.user._id;

    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'No valid fields provided for update');
    }

    const task = await Task.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email');

    if (!task) return sendError(res, 404, 'Task not found or unauthorized');

    logger.info(`Task updated: ${req.params.id} by ${req.user.email}`);
    return sendSuccess(res, 200, 'Task updated successfully', task);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /tasks/:id — Soft delete
 */
const deleteTask = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.owner = req.user._id;

    const task = await Task.findOneAndUpdate(
      filter,
      { isDeleted: true },
      { new: true }
    );

    if (!task) return sendError(res, 404, 'Task not found or unauthorized');

    logger.info(`Task soft-deleted: ${req.params.id} by ${req.user.email}`);
    return sendSuccess(res, 200, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /tasks/stats — Task statistics (admin only)
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, 200, 'Stats fetched', { statusStats: stats, priorityStats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getStats };
