import knex from '../config/database.js';

class Farmer {
  static async create(data) {
    const [id] = await knex('farmers').insert({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  static async findById(id) {
    return knex('farmers').where('id', id).first();
  }

  static async findAll() {
    return knex('farmers');
  }

  static async findByXRPAddress(address) {
    return knex('farmers').where('xrp_address', address).first();
  }

  static async update(id, data) {
    await knex('farmers')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date(),
      });
    return this.findById(id);
  }

  static async delete(id) {
    return knex('farmers').where('id', id).delete();
  }

  static async getStats() {
    const totalFarmers = await knex('farmers').count('* as count').first();
    const farmersByLocation = await knex('farmers')
      .select('location')
      .count('* as count')
      .groupBy('location');

    const farmersByCrop = await knex('farmers')
      .select('primary_crop')
      .count('* as count')
      .groupBy('primary_crop');

    return {
      total: totalFarmers.count,
      byLocation: farmersByLocation,
      byCrop: farmersByCrop,
    };
  }

  static async getEscrowStats(farmerId) {
    const escrows = await knex('escrows')
      .where('farmer_id', farmerId)
      .select('status')
      .count('* as count')
      .groupBy('status');

    const totalAmount = await knex('escrows')
      .where('farmer_id', farmerId)
      .sum('amount as total')
      .first();

    return {
      byStatus: escrows,
      totalAmount: totalAmount.total || 0,
    };
  }

  static async getPracticeStats(farmerId) {
    return knex('escrows')
      .where('farmer_id', farmerId)
      .select('practice_type')
      .count('* as count')
      .groupBy('practice_type');
  }

  static async getActiveFarmers() {
    return knex('farmers')
      .join('escrows', 'farmers.id', 'escrows.farmer_id')
      .select('farmers.*')
      .where('escrows.status', 'pending')
      .distinct();
  }

  static async getTopPerformers(limit = 5) {
    return knex('farmers')
      .join('escrows', 'farmers.id', 'escrows.farmer_id')
      .select(
        'farmers.*',
        knex.raw('COUNT(CASE WHEN escrows.status = "released" THEN 1 END) as successful_escrows'),
        knex.raw('SUM(CASE WHEN escrows.status = "released" THEN escrows.amount ELSE 0 END) as total_released')
      )
      .groupBy('farmers.id')
      .orderBy('successful_escrows', 'desc')
      .limit(limit);
  }
}

export default Farmer;
