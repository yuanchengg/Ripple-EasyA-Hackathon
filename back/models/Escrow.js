import knex from '../config/database.js';

class Escrow {
  static async create(data) {
    const [id] = await knex('escrows').insert({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  static async findById(id) {
    return knex('escrows')
      .join('farmers', 'escrows.farmer_id', 'farmers.id')
      .select(
        'escrows.*',
        'farmers.name as farmer_name',
        'farmers.location as farmer_location'
      )
      .where('escrows.id', id)
      .first();
  }

  static async findAll() {
    return knex('escrows')
      .join('farmers', 'escrows.farmer_id', 'farmers.id')
      .select(
        'escrows.*',
        'farmers.name as farmer_name',
        'farmers.location as farmer_location'
      );
  }

  static async findByFarmerId(farmerId) {
    return knex('escrows')
      .join('farmers', 'escrows.farmer_id', 'farmers.id')
      .select(
        'escrows.*',
        'farmers.name as farmer_name',
        'farmers.location as farmer_location'
      )
      .where('escrows.farmer_id', farmerId);
  }

  static async update(id, data) {
    await knex('escrows')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date(),
      });
    return this.findById(id);
  }

  static async delete(id) {
    return knex('escrows').where('id', id).delete();
  }

  static async getStats() {
    const stats = await knex('escrows')
      .select('status')
      .count('* as count')
      .groupBy('status');

    const totalAmount = await knex('escrows')
      .sum('amount as total')
      .first();

    return {
      byStatus: stats,
      totalAmount: totalAmount.total || 0,
    };
  }

  static async getPracticeStats() {
    return knex('escrows')
      .select('practice_type')
      .count('* as count')
      .groupBy('practice_type');
  }

  static async getPendingEscrows() {
    return knex('escrows')
      .join('farmers', 'escrows.farmer_id', 'farmers.id')
      .select(
        'escrows.*',
        'farmers.name as farmer_name',
        'farmers.location as farmer_location'
      )
      .where('escrows.status', 'pending')
      .orderBy('escrows.deadline', 'asc');
  }

  static async getExpiringEscrows(days = 7) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    return knex('escrows')
      .join('farmers', 'escrows.farmer_id', 'farmers.id')
      .select(
        'escrows.*',
        'farmers.name as farmer_name',
        'farmers.location as farmer_location'
      )
      .where('escrows.status', 'pending')
      .where('escrows.deadline', '<=', expirationDate)
      .orderBy('escrows.deadline', 'asc');
  }
}

export default Escrow;
