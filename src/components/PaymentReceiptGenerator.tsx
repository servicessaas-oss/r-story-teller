import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface PaymentReceiptGeneratorProps {
  paymentData: {
    receiptNumber: string;
    paymentDate: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    acidNumber: string;
    customerInfo: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
    companyInfo: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
    items: {
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
    subtotal: number;
    discount: number;
    taxRate: number;
    tax: number;
    shippingHandling: number;
  };
}

export function PaymentReceiptGenerator({ paymentData }: PaymentReceiptGeneratorProps) {
  const handleDownloadPDF = () => {
    const receiptElement = document.getElementById('payment-receipt');
    if (!receiptElement) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${paymentData.receiptNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ddd;
            }
            .receipt-header {
              background: #c41e3a;
              color: white;
              padding: 15px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
            }
            .receipt-body {
              padding: 20px;
            }
            .company-info, .customer-info {
              margin-bottom: 20px;
            }
            .company-info {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .logo-placeholder {
              width: 80px;
              height: 80px;
              background: #666;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
            }
            .bill-to, .ship-to {
              flex: 1;
              margin-right: 20px;
            }
            .bill-to h3, .ship-to h3 {
              color: #666;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th {
              background: #c41e3a;
              color: white;
              padding: 10px;
              text-align: left;
              font-size: 14px;
            }
            .items-table td {
              padding: 8px 10px;
              border-bottom: 1px solid #eee;
            }
            .items-table tr:nth-child(even) {
              background: #f9f9f9;
            }
            .totals-section {
              margin-top: 20px;
              text-align: right;
            }
            .totals-section div {
              margin: 5px 0;
            }
            .total-paid {
              font-size: 18px;
              font-weight: bold;
              border-top: 2px solid #333;
              padding-top: 10px;
            }
            .receipt-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .receipt-info div {
              text-align: right;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              RECEIPT
            </div>
            <div class="receipt-body">
              <div class="company-info">
                <div>
                  <h2>${paymentData.companyInfo.name}</h2>
                  <p>${paymentData.companyInfo.address}</p>
                  <p>${paymentData.companyInfo.phone}</p>
                  <p>${paymentData.companyInfo.email}</p>
                </div>
                <div class="receipt-info">
                  <div>
                    <div><strong>PAYMENT DATE</strong></div>
                    <div>${paymentData.paymentDate}</div>
                    <br>
                    <div><strong>RECEIPT NO.</strong></div>
                    <div>${paymentData.receiptNumber}</div>
                  </div>
                </div>
                <div class="logo-placeholder">LOGO</div>
              </div>

              <div class="info-section">
                <div class="bill-to">
                  <h3>BILL TO</h3>
                  <div>${paymentData.customerInfo.name}</div>
                  <div>${paymentData.customerInfo.address}</div>
                  <div>${paymentData.customerInfo.phone}</div>
                  <div>${paymentData.customerInfo.email}</div>
                </div>
                <div class="ship-to">
                  <h3>SHIP TO</h3>
                  <div>${paymentData.customerInfo.name}</div>
                  <div>${paymentData.customerInfo.address}</div>
                  <div>${paymentData.customerInfo.phone}</div>
                </div>
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>DESCRIPTION</th>
                    <th>QTY</th>
                    <th>UNIT PRICE</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${paymentData.items.map(item => `
                    <tr>
                      <td>${item.description}</td>
                      <td>${item.quantity}</td>
                      <td>$${item.unitPrice.toFixed(2)}</td>
                      <td>$${item.total.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  ${Array(8 - paymentData.items.length).fill(0).map(() => `
                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>$0.00</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="totals-section">
                <div>SUBTOTAL: $${paymentData.subtotal.toFixed(2)}</div>
                <div>DISCOUNT: $${paymentData.discount.toFixed(2)}</div>
                <div>SUBTOTAL LESS DISCOUNT: $${(paymentData.subtotal - paymentData.discount).toFixed(2)}</div>
                <div>TAX RATE: ${(paymentData.taxRate * 100).toFixed(2)}%</div>
                <div>TOTAL TAX: $${paymentData.tax.toFixed(2)}</div>
                <div>SHIPPING/HANDLING: $${paymentData.shippingHandling.toFixed(2)}</div>
                <div class="total-paid">Paid $ ${paymentData.amount.toFixed(2)}</div>
              </div>

              <div style="margin-top: 30px; font-size: 12px; color: #666;">
                <p>Remarks/notes...</p>
                <p>Transaction ID: ${paymentData.transactionId}</p>
                <p>ACID Number: ${paymentData.acidNumber}</p>
                <p>Payment Method: ${paymentData.paymentMethod}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Wait for content to load, then trigger download
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handlePrint = () => {
    handleDownloadPDF();
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Payment Receipt</CardTitle>
          <div className="flex items-center gap-2 no-print">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div id="payment-receipt" className="bg-white">
          {/* Receipt Header */}
          <div className="bg-red-700 text-white text-center py-4 text-2xl font-bold">
            RECEIPT
          </div>

          {/* Receipt Body */}
          <div className="p-6 space-y-6">
            {/* Company Info and Receipt Details */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-blue-600">{paymentData.companyInfo.name}</h2>
                <p className="text-sm text-gray-600">{paymentData.companyInfo.address}</p>
                <p className="text-sm text-gray-600">{paymentData.companyInfo.phone}</p>
                <p className="text-sm text-gray-600">{paymentData.companyInfo.email}</p>
              </div>
              
              <div className="text-right">
                <div className="mb-4">
                  <div className="font-semibold text-sm">PAYMENT DATE</div>
                  <div className="text-sm">{paymentData.paymentDate}</div>
                </div>
                <div>
                  <div className="font-semibold text-sm">RECEIPT NO.</div>
                  <div className="text-sm">{paymentData.receiptNumber}</div>
                </div>
              </div>

              <div className="w-20 h-20 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                LOGO
              </div>
            </div>

            {/* Bill To and Ship To */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">BILL TO</h3>
                <div className="text-sm space-y-1">
                  <div className="text-blue-600">{paymentData.customerInfo.name}</div>
                  <div>{paymentData.customerInfo.address}</div>
                  <div>{paymentData.customerInfo.phone}</div>
                  <div className="text-blue-600">{paymentData.customerInfo.email}</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">SHIP TO</h3>
                <div className="text-sm space-y-1">
                  <div className="text-blue-600">{paymentData.customerInfo.name}</div>
                  <div>{paymentData.customerInfo.address}</div>
                  <div>{paymentData.customerInfo.phone}</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-700 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">DESCRIPTION</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">QTY</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">UNIT PRICE</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentData.items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-2 text-sm">{item.description}</td>
                      <td className="px-4 py-2 text-sm text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                  
                  {/* Empty rows to match the template */}
                  {Array(Math.max(0, 8 - paymentData.items.length)).fill(0).map((_, index) => (
                    <tr key={`empty-${index}`} className={(paymentData.items.length + index) % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-2 text-sm">&nbsp;</td>
                      <td className="px-4 py-2 text-sm">&nbsp;</td>
                      <td className="px-4 py-2 text-sm">&nbsp;</td>
                      <td className="px-4 py-2 text-sm text-right">$0.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>${paymentData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>DISCOUNT:</span>
                  <span>${paymentData.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SUBTOTAL LESS DISCOUNT:</span>
                  <span>${(paymentData.subtotal - paymentData.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TAX RATE:</span>
                  <span>{(paymentData.taxRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>TOTAL TAX:</span>
                  <span>${paymentData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SHIPPING/HANDLING:</span>
                  <span>${paymentData.shippingHandling.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-gray-800 font-bold text-lg">
                  <span>Paid $</span>
                  <span>${paymentData.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Notes */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">Remarks/notes...</p>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>Transaction ID: {paymentData.transactionId}</p>
                <p>ACID Number: {paymentData.acidNumber}</p>
                <p>Payment Method: {paymentData.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}