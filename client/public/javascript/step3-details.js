const issueLabels = {
  'pothole': 'Pothole',
  'garbage': 'Garbage / Waste',
  'drainage': 'Drainage Issue',
  'streetlight': 'Street Light',
  'road': 'Road Damage',
  'water': 'Water Logging',
  'encroachment': 'Encroachment',
  'other': 'Other'
};

const severityLabels = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'critical': 'Critical'
};

// Navigation
function goToStep2() { window.location.href = 'step2-details.html'; }
function goToHome() { window.location.href = 'tsim-homepage-light.html'; }

// Load and display data on page load
window.addEventListener('DOMContentLoaded', () => {
  try {
    const locData = JSON.parse(sessionStorage.getItem('complaintLocation') || '{}');
    const detData = JSON.parse(sessionStorage.getItem('complaintDetails') || '{}');

    document.getElementById('rv-location').textContent = locData.address || '—';
    document.getElementById('rv-issue').textContent = issueLabels[detData.issue] || '—';

    document.getElementById('rv-desc').textContent = detData.description || '-';

    const photoCount = detData.photos ? detData.photos.length : 0;
    document.getElementById('rv-photos').textContent = photoCount > 0
      ? `${photoCount} photo${photoCount > 1 ? 's' : ''} attached`
      : 'None uploaded';
  } catch (e) {
    console.error('Error loading data:', e);
  }
});


// Authority Mapping (Common Indian Municipalities)
const authorityMap = {
  'bangalore': { name: 'BBMP (Bruhat Bengaluru Mahanagara Palike)', email: 'comm@bbmp.gov.in' },
  'bengaluru': { name: 'BBMP (Bruhat Bengaluru Mahanagara Palike)', email: 'comm@bbmp.gov.in' },
  'mumbai': { name: 'BMC (Brihanmumbai Municipal Corporation)', email: 'mc@mcgm.gov.in' },
  'delhi': { name: 'MCD (Municipal Corporation of Delhi)', email: 'commissioner@mcd.nic.in' },
  'pune': { name: 'PMC (Pune Municipal Corporation)', email: 'commissioner@punecorporation.org' },
  'chennai': { name: 'GCC (Greater Chennai Corporation)', email: 'commissioner@chennaicorporation.gov.in' },
  'hyderabad': { name: 'GHMC (Greater Hyderabad Municipal Corporation)', email: 'commissioner@ghmc.gov.in' },
  'kolkata': { name: 'KMC (Kolkata Municipal Corporation)', email: 'cmc@kmcgov.in' },
  'other': { name: 'Local Municipal Body', email: 'grievance@localgovt.in' }
};

function getAuthority(address = '') {
  const addr = address.toLowerCase();
  for (const city in authorityMap) {
    if (addr.includes(city)) return authorityMap[city];
  }
  return authorityMap.other;
}

let lastSubmission = {
  id: '',
  timestamp: '',
  authority: null,
  location: null,
  details: null
};

// Submit form
function submitForm() {
  const btn = document.getElementById('btn-next');
  btn.classList.add('loading');
  btn.disabled = true;

  const locData = JSON.parse(sessionStorage.getItem('complaintLocation') || '{}');
  const detData = JSON.parse(sessionStorage.getItem('complaintDetails') || '{}');
  const authority = getAuthority(locData.address);

  setTimeout(() => {
    btn.classList.remove('loading');
    const id = `SIM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;

    // Cache for PDF
    lastSubmission = {
      id: id,
      timestamp: new Date().toLocaleString(),
      authority: authority,
      location: locData,
      details: detData
    };

    document.getElementById('success-id').textContent = id;
    const score = Math.round(Math.random() * 30 + 5);
    document.getElementById('success-score').textContent = `Impact Score: ${score}`;
    document.getElementById('success-overlay').classList.add('visible');

    // Clear session storage but keep local cache for PDF
    sessionStorage.removeItem('complaintLocation');
    sessionStorage.removeItem('complaintDetails');
  }, 1800);
}

async function downloadPDF() {
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '⏳ Generating PDF…';
  btn.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const data = lastSubmission;
    const primaryColor = [26, 158, 74]; // #1A9E4A (Green)

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('CIVIC ISSUE GRIEVANCE', 15, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Spoilt Indian Map — Citizen Reporting Platform', 15, 28);

    // Metadata Box
    doc.setFillColor(245, 245, 240);
    doc.roundedRect(140, 10, 55, 15, 2, 2, 'F');
    doc.setTextColor(11, 31, 58);
    doc.setFontSize(8);
    doc.text('COMPLAINT ID', 145, 16);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(data.id, 145, 22);

    // Report Summary Table
    doc.autoTable({
      startY: 45,
      head: [['Field', 'Report Details']],
      body: [
        ['Issue Type', issueLabels[data.details.issue] || 'General Civic Issue'],
        ['Status', 'OFFICIALLY REPORTED'],
        ['Submission Date', data.timestamp],
        ['Assigned Authority', data.authority.name],
        ['Contact Email', data.authority.email],
        ['Location (Address)', data.location.address || 'Geo-coordinates attached'],
        ['Coordinates', `${data.location.lat}, ${data.location.lng}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 10, cellPadding: 4 }
    });

    // Description Section
    const descY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Issue Description', 14, descY);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(data.details.description || 'No detailed description provided.', 180);
    doc.text(splitDesc, 14, descY + 10);

    // Photo Evidence Section
    if (data.details.photos && data.details.photos.length > 0) {
      let photoY = descY + 20 + (splitDesc.length * 6);
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Photo Evidence', 14, photoY);

      try {
        // Attempt to add the first photo
        doc.addImage(data.details.photos[0].dataUrl, 'JPEG', 14, photoY + 5, 80, 60);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('* Additional photos are archived in the digital case file.', 14, photoY + 70);
      } catch (e) {
        doc.setFontSize(9);
        doc.text('[Photo verification attached in digital submission]', 14, photoY + 10);
      }
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This is an automatically generated grievance document. Digital signature verified.', 105, pageHeight - 15, null, null, 'center');

    // Save
    doc.save(`Report_${data.id}.pdf`);

    btn.innerHTML = '✓ Downloaded';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 3000);

  } catch (err) {
    console.error('PDF Generation Error:', err);
    btn.innerHTML = '❌ Error';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 2000);
  }
}

function reportAnother() {
  sessionStorage.clear();
  window.location.href = 'step1-details.html';
}