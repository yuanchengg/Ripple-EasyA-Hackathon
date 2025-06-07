import knex from '../config/database.js';

class Verification {
  static async create(data) {
    const [id] = await knex('verification_logs').insert({
      ...data,
      verified_at: new Date(),
    });
    return this.findById(id);
  }

  static async findById(id) {
    return knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .select(
        'verification_logs.*',
        'escrows.practice_type',
        'escrows.farmer_id'
      )
      .where('verification_logs.id', id)
      .first();
  }

  static async findAll() {
    return knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .select(
        'verification_logs.*',
        'escrows.practice_type',
        'escrows.farmer_id'
      )
      .orderBy('verified_at', 'desc');
  }

  static async findByEscrowId(escrowId) {
    return knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .select(
        'verification_logs.*',
        'escrows.practice_type',
        'escrows.farmer_id'
      )
      .where('verification_logs.escrow_id', escrowId)
      .orderBy('verified_at', 'desc');
  }

  static async getStats() {
    const totalVerifications = await knex('verification_logs')
      .count('* as count')
      .first();

    const verificationsByType = await knex('verification_logs')
      .select('verification_type')
      .count('* as count')
      .groupBy('verification_type');

    const verificationsByPractice = await knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .select('escrows.practice_type')
      .count('* as count')
      .groupBy('escrows.practice_type');

    return {
      total: totalVerifications.count,
      byType: verificationsByType,
      byPractice: verificationsByPractice,
    };
  }

  static async getRecentVerifications(limit = 10) {
    return knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .join('farmers', 'escrows.farmer_id', 'farmers.id')
      .select(
        'verification_logs.*',
        'escrows.practice_type',
        'farmers.name as farmer_name',
        'farmers.location as farmer_location'
      )
      .orderBy('verified_at', 'desc')
      .limit(limit);
  }

  static async getVerificationTimeline() {
    return knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .select(
        knex.raw('DATE(verified_at) as date'),
        knex.raw('COUNT(*) as count')
      )
      .groupBy('date')
      .orderBy('date', 'desc');
  }

  static async getVerificationSuccessRate() {
    const total = await knex('verification_logs').count('* as count').first();
    const successful = await knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .where('escrows.status', 'released')
      .count('* as count')
      .first();

    return {
      total: total.count,
      successful: successful.count,
      rate: total.count > 0 ? (successful.count / total.count) * 100 : 0,
    };
  }

  static async getVerificationByLocation() {
    return knex('verification_logs')
      .join('escrows', 'verification_logs.escrow_id', 'escrows.id')
      .join('farmers', 'escrows.farmer_id', 'farmers.id')
      .select('farmers.location')
      .count('* as count')
      .groupBy('farmers.location');
  }
}

export default Verification;
