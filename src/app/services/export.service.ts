import { Injectable } from '@angular/core';

export type ExportCell = string | number | null | undefined;

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportToExcel(filename: string, headers: string[], rows: ExportCell[][]): void {
    const escapeHtml = (value: string): string =>
      value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const headerRow = headers
      .map((h) => `<th style="background:#0f766e;color:#fff;font-weight:bold">${escapeHtml(h)}</th>`)
      .join('');

    const bodyRows = rows
      .map(
        (row) =>
          '<tr>' +
          row
            .map((cell) =>
              cell === null || cell === undefined ? '<td></td>' : `<td>${escapeHtml(String(cell))}</td>`
            )
            .join('') +
          '</tr>'
      )
      .join('');

    const excelHtml =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
      'xmlns:x="urn:schemas-microsoft-com:office:excel">' +
      '<head><meta charset="UTF-8"></head>' +
      '<body>' +
      `<table border="1">${headerRow}${bodyRows}</table>` +
      '</body></html>';

    const blob = new Blob(['\ufeff' + excelHtml], {
      type: 'application/vnd.ms-excel;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${filename}.xls`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}