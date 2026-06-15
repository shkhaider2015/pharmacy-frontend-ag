export function generateReceiptHTML(data: any) {
    // Format the date to be more readable
    const orderDate = new Date(data.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Generate the table rows for each item
    const itemsHtml = data.items.map((item: any) => {
        // Fallback: If 'name' is missing from the data, use a truncated ID
        const productName = item.product.name || `Product ID: ${item.product.id.split('-')[0]}...`;

        return `
      <tr>
        <td class="item-cell">${productName}</td>
        <td class="item-cell center">${item.quantity}</td>
        <td class="item-cell right">$${item.pricePerUnit.toFixed(2)}</td>
      </tr>
    `;
    }).join('');

    // Return the complete HTML string
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt - Order #${data.id.split('-')[0]}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #f9f9f9;
          padding: 20px;
        }
        .receipt-card {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }
        .header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 28px;
        }
        .meta-data {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          font-size: 14px;
          color: #555;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          background: #fff3cd;
          color: #856404;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          text-align: left;
          padding: 12px 8px;
          border-bottom: 2px solid #333;
          color: #2c3e50;
          font-weight: 600;
        }
        th.center, td.center { text-align: center; }
        th.right, td.right { text-align: right; }
        .item-cell {
          padding: 12px 8px;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-top: 20px;
          border-top: 2px solid #333;
          font-size: 20px;
        }
        .total-label {
          font-weight: 600;
          margin-right: 20px;
          color: #555;
        }
        .total-amount {
          font-weight: bold;
          color: #2c3e50;
        }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <h1>Sales Receipt</h1>
        </div>

        <div class="meta-data">
          <div>
            <strong>Order ID:</strong> ${data.id}<br>
            <strong>Date:</strong> ${orderDate}
          </div>
          <div style="text-align: right;">
            <span class="badge">${data.status}</span><br>
            <strong>Type:</strong> ${data.type}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th class="center">Qty</th>
              <th class="right">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-row">
          <span class="total-label">Total Amount:</span>
          <span class="total-amount">$${data.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </body>
    </html>
  `;
}   