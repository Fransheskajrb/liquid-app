import pool from "@/utils/db";

export const createCompany = async (userId, company) => {
  try {
    const result = await pool.query(
      `INSERT INTO companies (user_id, name, rut, address, phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      [userId, company.name, company.rut, company.address, company.phone]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error executing query", error);
    throw error;
  }
};

export const selectCompaniesByUserId = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM companies WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error executing query", error);
    throw error;
  }
};

// edit company should check if userid is the same as the company that is being edited