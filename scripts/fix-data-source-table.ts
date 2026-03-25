import mysql from 'mysql2/promise';

async function fixDataSourceTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root123',
    database: 'mydb',
  });

  try {
    // Check if the icon column exists
    const [columns] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'mydb' AND TABLE_NAME = 'pioc_data_sources' AND COLUMN_NAME = 'icon'`
    );

    if (columns.length > 0) {
      // Drop the icon column
      await connection.execute('ALTER TABLE pioc_data_sources DROP COLUMN icon');
      console.log('Successfully dropped icon column from pioc_data_sources table');
    } else {
      console.log('icon column does not exist or table does not exist');
    }
  } catch (error) {
    console.error('Error fixing data source table:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

fixDataSourceTable()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
