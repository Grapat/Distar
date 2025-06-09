import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

/**
 * Exports grouped cart data to an Excel file.
 *
 * @param {Array<Object>} data - An array of cart groups, where each group object should have:
 * - `user`: { user_id, name, email }
 * - `selectedAddress`: string (the address chosen for this group/order)
 * - `deliveryDate`: string (the delivery date chosen for this group/order, e.g., 'YYYY-MM-DD')
 * - `vegetables`: Array<{ Vegetable: { name: string }, quantity: number }>
 * @param {string} [baseFilename='Cart_Export'] - The base name for the Excel file.
 */
const exportCartToExcel = (data, baseFilename = 'Cart_Export') => {
    if (!data || data.length === 0) {
        console.warn('No data provided for Excel export.');
        return;
    }

    const worksheetData = [];

    // Add a header row with improved readability
    const headers = [
        'User ID',
        'User Name',
        'User Email',
        'Delivery Address',
        'Delivery Date',
        'Vegetable Name',
        'Quantity (Units)',
    ];
    worksheetData.push(headers);

    data.forEach(group => {
        const userId = group.user?.user_id || ''; // Use empty string instead of 'N/A' for cleaner Excel
        const userName = group.user?.name || '';
        const userEmail = group.user?.email || '';

        // These fields are crucial and assumed to be provided within the `group` object
        // from the component that calls this export function.
        const deliveryAddress = group.selectedAddress || '';
        const deliveryDate = group.deliveryDate ? new Date(group.deliveryDate).toISOString().slice(0, 10) : ''; // Format date consistently

        group.vegetables.forEach(vegItem => {
            worksheetData.push([
                userId,
                userName,
                userEmail,
                deliveryAddress,
                deliveryDate,
                vegItem.Vegetable?.name || 'Unknown Vegetable',
                vegItem.quantity,
            ]);
        });
    });

    // 2. Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Optional: Apply styling
    const headerStyle = {
        font: { bold: true, color: { rgb: "FF000000" } }, // Black bold text
        fill: { fgColor: { rgb: "FFE0E0E0" } }, // Light grey background
        alignment: { horizontal: "center", vertical: "center" }
    };

    // Apply header style
    for (let i = 0; i < headers.length; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
        if (ws[cellRef]) {
            ws[cellRef].s = headerStyle;
        }
    }

    // Auto-width columns based on content
    // Calculate max width for each column, considering the header text
    const colWidths = headers.map((header, i) =>
        Math.max(
            header.length, // Start with header length
            ...worksheetData.slice(1).map(row => (row[i] || '').toString().length)
        )
    );
    ws["!cols"] = colWidths.map(w => ({ wch: w + 2 })); // Add a little padding

    // 3. Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cart Orders"); // Sheet name

    // 4. Write the file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    // Generate a dynamic filename with a timestamp
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    saveAs(dataBlob, `${baseFilename}_${timestamp}.xlsx`);
};

export default exportCartToExcel;