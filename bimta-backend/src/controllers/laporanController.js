const pool = require('../config/database');
const ExcelJS = require('exceljs');

class LaporanController {
  static async generateLaporan(req, res, next) {
    try {
      const { jenis_laporan, start_date, end_date, program_studi } = req.query;

      if (!jenis_laporan) {
        return res.status(400).json({
          success: false,
          message: 'Jenis laporan harus dipilih',
        });
      }

      let query = '';
      let params = [];

      if (jenis_laporan === 'bulanan') {
        query = `
          SELECT 
            b.bimbingan_id,
            m.user_id as nim,
            m.nama as nama_mahasiswa,
            d.nama as nama_dosen,
            b.status_bimbingan,
            b.total_bimbingan,
            COUNT(p.progress_id) as total_progress,
            COUNT(CASE WHEN p.status_progress = 'done' THEN 1 END) as progress_selesai,
            COUNT(CASE WHEN p.status_progress = 'need_revision' THEN 1 END) as progress_revisi
          FROM bimbingan b
          JOIN users m ON b.mahasiswa_id = m.user_id
          JOIN users d ON b.dosen_id = d.user_id
          LEFT JOIN progress p ON b.bimbingan_id = p.bimbingan_id
        `;

        if (start_date && end_date) {
          query += ` WHERE p.datetime BETWEEN $1 AND $2`;
          params = [start_date, end_date];
        }

        query += ` GROUP BY b.bimbingan_id, m.user_id, m.nama, d.nama, b.status_bimbingan, b.total_bimbingan
                   ORDER BY b.bimbingan_id`;

      } else if (jenis_laporan === 'semester') {
        query = `
          SELECT 
            d.nama as nama_dosen,
            COUNT(DISTINCT b.bimbingan_id) as total_bimbingan,
            COUNT(DISTINCT CASE WHEN b.status_bimbingan = 'done' THEN b.bimbingan_id END) as bimbingan_selesai,
            COUNT(DISTINCT CASE WHEN b.status_bimbingan = 'ongoing' THEN b.bimbingan_id END) as bimbingan_berlangsung,
            AVG(b.total_bimbingan) as rata_rata_pertemuan
          FROM bimbingan b
          JOIN users d ON b.dosen_id = d.user_id
          LEFT JOIN progress p ON b.bimbingan_id = p.bimbingan_id
        `;

        let whereClause = [];
        let paramCount = 1;

        if (start_date && end_date) {
          whereClause.push(`p.datetime BETWEEN $${paramCount} AND $${paramCount + 1}`);
          params.push(start_date, end_date);
          paramCount += 2;
        }

        if (program_studi) {
          whereClause.push(`d.user_id LIKE $${paramCount}`);
          params.push(`%${program_studi}%`);
        }

        if (whereClause.length > 0) {
          query += ` WHERE ${whereClause.join(' AND ')}`;
        }

        query += ` GROUP BY d.nama ORDER BY total_bimbingan DESC`;
      }

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          jenis_laporan,
          periode: {
            start_date: start_date || null,
            end_date: end_date || null,
          },
          total_records: result.rows.length,
          laporan: result.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportLaporanExcel(req, res, next) {
    try {
      const { jenis_laporan, start_date, end_date, program_studi } = req.query;

      if (!jenis_laporan) {
        return res.status(400).json({
          success: false,
          message: 'Jenis laporan harus dipilih',
        });
      }

      let query = '';
      let params = [];

      if (jenis_laporan === 'bulanan') {
        query = `
          SELECT 
            b.bimbingan_id,
            m.user_id as nim,
            m.nama as nama_mahasiswa,
            d.nama as nama_dosen,
            b.status_bimbingan,
            b.total_bimbingan,
            COUNT(p.progress_id) as total_progress,
            COUNT(CASE WHEN p.status_progress = 'done' THEN 1 END) as progress_selesai,
            COUNT(CASE WHEN p.status_progress = 'need_revision' THEN 1 END) as progress_revisi
          FROM bimbingan b
          JOIN users m ON b.mahasiswa_id = m.user_id
          JOIN users d ON b.dosen_id = d.user_id
          LEFT JOIN progress p ON b.bimbingan_id = p.bimbingan_id
        `;

        if (start_date && end_date) {
          query += ` WHERE p.datetime BETWEEN $1 AND $2`;
          params = [start_date, end_date];
        }

        query += ` GROUP BY b.bimbingan_id, m.user_id, m.nama, d.nama, b.status_bimbingan, b.total_bimbingan
                   ORDER BY b.bimbingan_id`;

      } else if (jenis_laporan === 'semester') {
        query = `
          SELECT 
            d.nama as nama_dosen,
            COUNT(DISTINCT b.bimbingan_id) as total_bimbingan,
            COUNT(DISTINCT CASE WHEN b.status_bimbingan = 'done' THEN b.bimbingan_id END) as bimbingan_selesai,
            COUNT(DISTINCT CASE WHEN b.status_bimbingan = 'ongoing' THEN b.bimbingan_id END) as bimbingan_berlangsung,
            AVG(b.total_bimbingan) as rata_rata_pertemuan
          FROM bimbingan b
          JOIN users d ON b.dosen_id = d.user_id
          LEFT JOIN progress p ON b.bimbingan_id = p.bimbingan_id
        `;

        let whereClause = [];
        let paramCount = 1;

        if (start_date && end_date) {
          whereClause.push(`p.datetime BETWEEN $${paramCount} AND $${paramCount + 1}`);
          params.push(start_date, end_date);
          paramCount += 2;
        }

        if (program_studi) {
          whereClause.push(`d.user_id LIKE $${paramCount}`);
          params.push(`%${program_studi}%`);
        }

        if (whereClause.length > 0) {
          query += ` WHERE ${whereClause.join(' AND ')}`;
        }

        query += ` GROUP BY d.nama ORDER BY total_bimbingan DESC`;
      }

      const result = await pool.query(query, params);

      // Validasi data
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tidak ada data untuk periode yang dipilih',
        });
      }

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sistem Bimbingan';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet(
        jenis_laporan === 'bulanan' ? 'Laporan Bulanan' : 'Laporan Semester'
      );

      // Styling
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        },
        alignment: { vertical: 'middle', horizontal: 'center' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };

      const titleStyle = {
        font: { bold: true, size: 16, color: { argb: 'FF2F5597' } },
        alignment: { vertical: 'middle', horizontal: 'center' },
      };

      // Add title
      const titleMerge = jenis_laporan === 'bulanan' ? 'A1:G1' : 'A1:F1';
      worksheet.mergeCells(titleMerge);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `Laporan Bimbingan ${jenis_laporan === 'bulanan' ? 'Bulanan' : 'Semester'}`;
      titleCell.style = titleStyle;

      // Add info
      const infoMerge = jenis_laporan === 'bulanan' ? 'A2:G2' : 'A2:F2';
      worksheet.mergeCells(infoMerge);
      const infoCell = worksheet.getCell('A2');
      if (start_date && end_date) {
        infoCell.value = `Periode: ${new Date(start_date).toLocaleDateString('id-ID')} - ${new Date(end_date).toLocaleDateString('id-ID')}`;
      } else {
        infoCell.value = 'Periode: Semua Data';
      }
      infoCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // Add empty row
      worksheet.addRow([]);

      if (jenis_laporan === 'bulanan') {
        // Headers for Bulanan
        const headerRow = worksheet.addRow([
          'No',
          'NIM',
          'Nama Mahasiswa',
          'Dosen Pembimbing',
          'Status',
          'Total Bimbingan',
          'Progress (Selesai/Total)',
        ]);

        headerRow.eachCell((cell) => {
          cell.style = headerStyle;
        });

        // Set column widths
        worksheet.columns = [
          { key: 'no', width: 8 },
          { key: 'nim', width: 15 },
          { key: 'nama_mahasiswa', width: 25 },
          { key: 'nama_dosen', width: 25 },
          { key: 'status', width: 15 },
          { key: 'total_bimbingan', width: 18 },
          { key: 'progress', width: 25 },
        ];

        // Add data rows
        result.rows.forEach((row, index) => {
          const dataRow = worksheet.addRow([
            index + 1,
            row.nim,
            row.nama_mahasiswa,
            row.nama_dosen,
            row.status_bimbingan,
            row.total_bimbingan || 0,
            `${row.progress_selesai || 0}/${row.total_progress || 0}`,
          ]);

          // Apply border to all cells
          dataRow.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });

          // Color code status
          const statusCell = dataRow.getCell(5);
          if (row.status_bimbingan === 'done') {
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFC6EFCE' },
            };
          } else if (row.status_bimbingan === 'ongoing') {
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFBDD7EE' },
            };
          }
        });

      } else {
        // Headers for Semester
        const headerRow = worksheet.addRow([
          'No',
          'Dosen Pembimbing',
          'Total Bimbingan',
          'Selesai',
          'Berlangsung',
          'Rata-rata Pertemuan',
        ]);

        headerRow.eachCell((cell) => {
          cell.style = headerStyle;
        });

        // Set column widths
        worksheet.columns = [
          { key: 'no', width: 8 },
          { key: 'nama_dosen', width: 30 },
          { key: 'total_bimbingan', width: 18 },
          { key: 'selesai', width: 15 },
          { key: 'berlangsung', width: 15 },
          { key: 'rata_rata', width: 20 },
        ];

        // Add data rows
        result.rows.forEach((row, index) => {
          const dataRow = worksheet.addRow([
            index + 1,
            row.nama_dosen,
            row.total_bimbingan,
            row.bimbingan_selesai,
            row.bimbingan_berlangsung,
            parseFloat(row.rata_rata_pertemuan || 0).toFixed(1),
          ]);

          // Apply border to all cells
          dataRow.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        });
      }

      // Add summary row
      worksheet.addRow([]);
      const summaryRow = worksheet.addRow([
        '',
        'Total Data:',
        result.rows.length,
      ]);
      summaryRow.getCell(2).font = { bold: true };

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      const filename = `Laporan_${jenis_laporan}_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      // Send file
      res.send(buffer);

    } catch (error) {
      console.error('Export error:', error);
      next(error);
    }
  }

  static async getLaporanStatistik(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      // Statistik umum
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT b.bimbingan_id) as total_bimbingan,
          COUNT(DISTINCT b.mahasiswa_id) as total_mahasiswa_bimbingan,
          COUNT(DISTINCT b.dosen_id) as total_dosen_pembimbing,
          COUNT(DISTINCT p.progress_id) as total_progress,
          AVG(b.total_bimbingan) as rata_rata_pertemuan
        FROM bimbingan b
        LEFT JOIN progress p ON b.bimbingan_id = p.bimbingan_id
        ${start_date && end_date ? 'WHERE p.datetime BETWEEN $1 AND $2' : ''}
      `;

      const params = start_date && end_date ? [start_date, end_date] : [];
      const statsResult = await pool.query(statsQuery, params);

      // Status bimbingan
      const statusQuery = `
        SELECT 
          status_bimbingan,
          COUNT(*) as jumlah
        FROM bimbingan
        GROUP BY status_bimbingan
      `;
      const statusResult = await pool.query(statusQuery);

      res.json({
        success: true,
        data: {
          statistik_umum: statsResult.rows[0],
          status_bimbingan: statusResult.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LaporanController;