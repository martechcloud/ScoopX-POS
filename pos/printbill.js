// This Prints the bill

function printbill() {
  const table = document.querySelector(".styled-table");
  const subtotal = document.getElementById("subtotal")?.textContent || "0.00";
  const discount = document.getElementById("bill-discount")?.value || "0";
  const roundOff = document.getElementById("round-off")?.value || "0";
  const paymentType =
    document.querySelector('input[name="paymentType"]:checked')?.value ||
    "Cash";

  const now = new Date();
  const formattedDate = now.toLocaleDateString();
  const formattedTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const selectedTable =
    document.querySelector(".table-btn.active")?.dataset.table || "N/A";

  const total = (
    parseFloat(subtotal) -
    (subtotal * discount) / 100 +
    parseFloat(roundOff)
  ).toFixed(2);

  const billHTML = `
          <div id="thermal-receipt" style="
            width: 58mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #000;
            margin: 0 auto;
            text-align: center;
          ">
            <h2 style="font-size:14px;margin:5px 0;">ScoopX Ice Cream Cafe</h2>
            <p style="margin:0;">Address: Pali, Near Ballaleshwar Mandir</p>
            <p style="margin:0;">Mon. 8087649190</p>
            <hr style="border: none; border-top: 1px dashed #000; margin: 5px 0;">
            <p><strong>CASH RECEIPT</strong></p>
            <hr style="border: none; border-top: 1px dashed #000; margin: 5px 0;">
            
            <table style="width:100%; border-collapse:collapse; text-align:left;">
              <thead>
                <tr>
                  <th style="font-weight:bold;">Description</th>
                  <th style="text-align:right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${Array.from(table.querySelectorAll("tbody tr"))
                  .map((row) => {
                    const name = row.cells[0]?.innerText || "";
                    const total = row.cells[2]?.innerText || "0.00";
                    return `<tr><td>${name}</td><td style="text-align:right;">${total}</td></tr>`;
                  })
                  .join("")}
              </tbody>
            </table>

            <hr style="border: none; border-top: 1px dashed #000; margin: 5px 0;">
            <div style="text-align:right; margin-top:5px;">
              <p style="margin:1px 0;">Subtotal: ₹${subtotal}</p>
              <p style="margin:1px 0;">Discount: ${discount}%</p>
              <p style="margin:1px 0;">Round Off: ₹${roundOff}</p>
              <p style="margin:1px 0;"><strong>Total: ₹${total}</strong></p>
              <p style="margin:1px 0;">Payment: ${paymentType}</p>
            </div>

            <hr style="border: none; border-top: 1px dashed #000; margin: 5px 0;">
            <p>Thank You!</p>
            <p>Visit Again.</p>
            <hr style="border: none; border-top: 1px dashed #000; margin: 5px 0;">
          </div>
        `;

  const printFrame = document.createElement("iframe");
  printFrame.style.position = "absolute";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";
  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(`
          <html>
            <head>
              <title>Print Bill</title>
              <style>
                @media print {
                  @page {
                    size: 58mm auto;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                  }
                }
              </style>
            </head>
            <body>${billHTML}</body>
          </html>
        `);
  frameDoc.close();

  printFrame.onload = () => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    setTimeout(() => document.body.removeChild(printFrame), 1000);
  };
}
