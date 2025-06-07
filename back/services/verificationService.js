import knex from '../config/database.js';

export const verifyPractice = async (escrowId, verificationData) => {
  try {
    const escrow = await knex('escrows').where('id', escrowId).first();
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'pending') {
      throw new Error('Escrow is not in pending status');
    }

    // Validate verification data based on practice type
    const isValid = await validateVerificationData(escrow.practice_type, verificationData);
    if (!isValid) {
      throw new Error('Invalid verification data');
    }

    // Update escrow status
    await knex('escrows').where('id', escrowId).update({
      status: 'verified',
      verification_data: JSON.stringify(verificationData),
      verified_at: new Date(),
      updated_at: new Date(),
    });

    // Log verification
    await knex('verification_logs').insert({
      escrow_id: escrowId,
      verification_type: verificationData.type,
      verification_data: JSON.stringify(verificationData),
      verified_at: new Date(),
    });

    return true;
  } catch (error) {
    console.error('Error verifying practice:', error);
    throw error;
  }
};

const validateVerificationData = async (practiceType, verificationData) => {
  switch (practiceType) {
    case 'drought_resistant':
      return validateDroughtResistantData(verificationData);
    case 'water_saving':
      return validateWaterSavingData(verificationData);
    case 'soil_conservation':
      return validateSoilConservationData(verificationData);
    case 'agroforestry':
      return validateAgroforestryData(verificationData);
    case 'organic_farming':
      return validateOrganicFarmingData(verificationData);
    default:
      return false;
  }
};

const validateDroughtResistantData = (data) => {
  // Validate satellite imagery showing drought-resistant crop planting
  return data.type === 'satellite' && 
         data.coverage_area >= 0.5 && // At least 50% of farm area
         data.crop_type === 'drought_resistant';
};

const validateWaterSavingData = (data) => {
  // Validate irrigation system installation and water usage reduction
  return data.type === 'irrigation_system' && 
         data.system_type === 'water_saving' &&
         data.water_reduction >= 30; // At least 30% water reduction
};

const validateSoilConservationData = (data) => {
  // Validate soil conservation practices
  return data.type === 'soil_analysis' &&
         data.soil_quality_improvement >= 20 && // At least 20% improvement
         data.erosion_reduction >= 40; // At least 40% erosion reduction
};

const validateAgroforestryData = (data) => {
  // Validate tree planting and integration
  return data.type === 'satellite' &&
         data.tree_coverage >= 0.3 && // At least 30% tree coverage
         data.integration_score >= 0.7; // At least 70% integration score
};

const validateOrganicFarmingData = (data) => {
  // Validate organic farming practices
  return data.type === 'certification' &&
         data.certification_type === 'organic' &&
         data.compliance_score >= 0.8; // At least 80% compliance
};

export const getVerificationLogs = async (escrowId = null) => {
  try {
    let query = knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .select(
        'verification_logs.*',
        'escrows.practice_type',
        'escrows.farmer_id'
      );

    if (escrowId) {
      query = query.where('escrow_id', escrowId);
    }

    return await query.orderBy('verified_at', 'desc');
  } catch (error) {
    console.error('Error fetching verification logs:', error);
    throw error;
  }
};

export const getVerificationStats = async () => {
  try {
    const stats = await knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .select('escrows.practice_type')
      .count('* as count')
      .groupBy('escrows.practice_type');

    return stats;
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    throw error;
  }
};
