import crypto from 'crypto';

export const generateOTP = (expireMinutes = 10) => {
  const otp = crypto.randomBytes(3).toString('hex');
  const otpExpire = Date.now() + expireMinutes * 60 * 1000;

  return {
    otp,
    otpExpire,
  };
};
