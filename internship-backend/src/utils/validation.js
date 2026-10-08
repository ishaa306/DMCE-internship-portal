export const validateInternshipData = (data) => {
  const errors = [];

  const requiredFields = [
    'company_name',
    'location',
    'role',
    'work_mode',
    'start_date',
    'duration'
  ];

  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || !data[field].trim()) {
      errors.push(`${field} is required.`);
    }
  }

  const validWorkModes = ['on-site', 'hybrid', 'remote', 'On-site', 'Hybrid', 'Remote'];
  if (data.work_mode && !validWorkModes.includes(data.work_mode)) {
    errors.push('Invalid work_mode. Must be on-site, hybrid, or remote.');
  }

  if (data.has_incentives === true || data.has_incentives === 'Yes') {
    if (!data.incentive_amount || typeof data.incentive_amount !== 'string' || !data.incentive_amount.trim()) {
      errors.push('incentive_amount is required when has_incentives is true.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
