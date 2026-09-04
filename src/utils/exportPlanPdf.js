import { format } from 'date-fns';

const escapePdfText = (value) => String(value)
  .replace(/[^\x20-\x7E]/g, '-')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const byteLength = (value) => new TextEncoder().encode(value).length;

function pageStream(lines) {
  let y = 742;
  const commands = ['BT', '/F1 10 Tf'];

  for (const line of lines) {
    commands.push(`1 0 0 1 50 ${y} Tm (${escapePdfText(line)}) Tj`);
    y -= line.startsWith('  ') ? 14 : 18;
  }

  commands.push('ET');
  return commands.join('\n');
}

function paginate(lines) {
  const pages = [];
  let current = [];
  let height = 0;

  for (const line of lines) {
    const lineHeight = line.startsWith('  ') ? 14 : 18;
    if (height + lineHeight > 670 && current.length) {
      pages.push(current);
      current = [];
      height = 0;
    }
    current.push(line);
    height += lineHeight;
  }
  if (current.length) pages.push(current);
  return pages;
}

function makePdf(pages) {
  const objects = [];
  const addObject = (value) => {
    objects.push(value);
    return objects.length;
  };

  const catalog = addObject('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesObject = addObject('');
  const pageNumbers = [];
  const contentNumbers = [];

  for (const page of pages) {
    pageNumbers.push(addObject(''));
    const stream = pageStream(page);
    contentNumbers.push(addObject(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`));
  }

  const font = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects[pagesObject - 1] = `<< /Type /Pages /Kids [${pageNumbers.map(number => `${number} 0 R`).join(' ')}] /Count ${pageNumbers.length} >>`;
  pageNumbers.forEach((number, index) => {
    objects[number - 1] = `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${contentNumbers[index]} 0 R >>`;
  });

  let output = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(byteLength(output));
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = byteLength(output);
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => { output += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([output], { type: 'application/pdf' });
}

export function downloadPlanPdf({ params, recommendations, totalPTOUsed }) {
  const totalDays = recommendations.reduce((sum, item) => sum + item.totalDays, 0);
  const lines = [
    'Calibreli - Time Off Plan',
    `Created ${format(new Date(), 'MMM d, yyyy')}`,
    '',
    `Planning period: ${format(params.startDate, 'MMM d, yyyy')} - ${format(params.endDate, 'MMM d, yyyy')}`,
    `Available PTO: ${params.ptoDays} days`,
    `PTO used: ${totalPTOUsed} days`,
    `Days away: ${totalDays}`,
    '',
    'Suggested breaks'
  ];

  recommendations.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.dateRange} - ${item.totalDays} days away`);
    lines.push(`  ${item.type}; ${item.ptoDaysUsed} PTO day${item.ptoDaysUsed === 1 ? '' : 's'}; ${item.weekendDays} regular day${item.weekendDays === 1 ? '' : 's'} off${item.holidayDays ? `; ${item.holidayDays} holiday${item.holidayDays === 1 ? '' : 's'}` : ''}`);
  });

  const url = URL.createObjectURL(makePdf(paginate(lines)));
  const link = document.createElement('a');
  link.href = url;
  link.download = `calibreli-plan-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
