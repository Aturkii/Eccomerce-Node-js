
import { AdminApplicationArchive } from '../../../db/models/admin/admin.archive.model.js';
import User from '../../../db/models/user/user.model.js';
import { AppError } from '../../utils/errorClass.js';
import { AdminApplication } from './../../../db/models/admin/admin.model.js';
import { asyncHandler } from './../../utils/asyncHandler.js';


//~ ____________________________ Apply for admin position ________________________

export const applyForAdmin = asyncHandler(async (req, res, next) => {
  const { applicationMessage, role } = req.body;
  const userId = req.user.id;

  const existingApplication = await AdminApplication.findOne({ user: userId });
  if (existingApplication) {
    return next(new AppError('You have already applied for an admin position.', 400));
  }

  const application = await AdminApplication.create({
    user: userId,
    applicationMessage,
    role,
  });

  res.status(201).json({
    status: 'success',
    message: 'Your application has been submitted successfully.',
    application,
  });
});

//~ ____________________________ update application ________________________________

export const updateAdminApplicationStatus = asyncHandler(async (req, res, next) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  const application = await AdminApplication.findById(applicationId).populate('user');

  if (!application) {
    return next(new AppError('Admin application not found.', 404));
  }

  if (application.status === 'approved' || application.status === 'rejected') {
    return next(new AppError(`Application has already been ${application.status}.`, 400));
  }

  if (status === 'approved') {
    const updatedUser = await User.findByIdAndUpdate(application.user._id, { role: application.role }, { new: true });

    if (!updatedUser) {
      return next(new AppError('Failed to update user role.', 500));
    }

    application.status = 'approved';
  } else if (status === 'rejected') {
    application.status = 'rejected';
  }

  await application.save();

  await AdminApplicationArchive.create({
    user: application.user._id,
    applicationMessage: application.applicationMessage,
    status: application.status,
    archivedAt: new Date(),
  });

  await AdminApplication.findByIdAndDelete(applicationId);

  res.status(200).json({
    status: 'success',
    message: `Application has been ${status}.`,
    application,
  });
});

//~ ____________________________ Get all applications _____________________________

export const getAdminApplications = asyncHandler(async (req, res, next) => {
  const applications = await AdminApplication.find().populate('user', 'firstName lastName email phone');

  res.status(200).json({
    status: 'success',
    results: applications.length,
    applications,
  });
});

//~ ____________________________ Get all archived applications ____________________

export const getArchivedApplications = asyncHandler(async (req, res, next) => {
  const adminApplicationArchive = await AdminApplicationArchive.find().populate('user', 'firstName lastName email phone');

  res.status(200).json({
    status: 'success',
    results: adminApplicationArchive.length,
    adminApplicationArchive,
  });
});
