import PDFDocument from "pdfkit";

export function createInvoice(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    let chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on("error", (err) => {
      reject(err);
    });

    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    doc.end();
  });
}

function generateHeader(doc) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Turki's Ecommerce shponeee.", 110, 57)
    .fontSize(10)
    .text("Ahmed Tukri.", 200, 50, { align: "right" })
    .text("Abu hommos", 200, 65, { align: "right" })
    .text("beheira, EG, 10025", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Order Details", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Order Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font("Helvetica")
    .text("Order Date:", 50, customerInformationTop + 15)
    .text(formatDate(invoice.date), 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(
      formatCurrency(invoice.subtotal * 100),
      150,
      customerInformationTop + 30
    )
    .font("Helvetica-Bold")
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.shipping.address, 300, customerInformationTop + 15)
    .text(
      `${invoice.shipping.city}, ${invoice.shipping.state}, ${invoice.shipping.country}`,
      300, customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Product",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.title,
      formatCurrency(item.price * 100),
      item.quantity,
      formatCurrency(item.price * item.quantity * 100)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(invoice.subtotal * 100)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Price after discount",
    "",
    formatCurrency(invoice.paid * 100)
  );

  const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Discount",
    "",
    `${invoice.discount}%`
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(doc, y, item, unitCost, quantity, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(unitCost, 150, y, { width: 90, align: "right" })
    .text(quantity, 280, y, { width: 90, align: "right" })
    .text(lineTotal, 370, y, { width: 90, align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
}
