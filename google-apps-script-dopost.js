/**
 * SBL SPECIALTY COATINGS - EHS SAFETY OBSERVATION WEB APP API
 * Target Spreadsheet: SBL Safety Management System
 * Sheet: 'Safety Log' (GID: 0 / 2132704242)
 * Target Drive Folder: 'SBL_Safety_Alert_Photos'
 * 
 * ============================================================================
 * INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1qxwTcS-2c87UAMH6c3xNPUT1MscKH5LXJwrgaSGTauY/edit
 * 2. Click: Extensions > Apps Script
 * 3. Replace all code in Code.gs with this entire file.
 * 4. To AUTHORIZE Google Drive permissions:
 *    - In the toolbar dropdown at the top, select 'authorizeAndTestDrive'
 *    - Click '▷ Run'
 *    - Click 'Review permissions' > Choose your Google account > 'Advanced' > 'Go to SBL Safety Command Center (unsafe)' > 'Allow'
 * 5. To DEPLOY the update:
 *    - In the top right, click 'Deploy' > 'Manage deployments'
 *    - Click the Pencil (Edit) icon next to the active Web App
 *    - Under 'Version', select 'New version'
 *    - Click 'Deploy' > 'Done'
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Wait up to 30s to prevent concurrent write collisions
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Server busy. Please try again.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // 1. Parse incoming parameters (support URL-encoded form data AND raw JSON payloads)
    var params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // Not JSON, parse as urlencoded
        var raw = e.postData.contents.split('&');
        for (var i = 0; i < raw.length; i++) {
          var pair = raw[i].split('=');
          params[decodeURIComponent(pair[0])] = decodeURIComponent((pair[1] || '').replace(/\+/g, ' '));
        }
      }
    }
    
    // Merge or fallback to e.parameter
    if (e && e.parameter) {
      for (var key in e.parameter) {
        if (!params[key]) {
          params[key] = e.parameter[key];
        }
      }
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.openById('1qxwTcS-2c87UAMH6c3xNPUT1MscKH5LXJwrgaSGTauY');
    }
    
    var sheet = ss.getSheetByName('Safety Log');
    if (!sheet) {
      sheet = ss.getActiveSheet();
      if (!sheet || sheet.getName().indexOf('Response') !== -1) {
        sheet = ss.getSheetByName('Safety Log') || ss.insertSheet('Safety Log');
      }
    }

    // 2. Determine or generate Report ID
    var reportId = params.reportId || '';
    if (!reportId) {
      var year = new Date().getFullYear();
      var lastRow = sheet.getLastRow();
      reportId = 'SA/' + year + '/' + ('00000' + Math.max(1, lastRow)).slice(-5);
    }

    // 3. Handle Photo Upload to Google Drive & Generate Shareable Link
    var attachmentUrl = 'N/A';
    var photoBase64 = params.photoBase64 || params.fileData || '';
    
    if (photoBase64 && photoBase64.length > 50) {
      try {
        // Retrieve or create 'SBL_Safety_Alert_Photos' Drive folder
        var folderName = 'SBL_Safety_Alert_Photos';
        var folders = DriveApp.getFoldersByName(folderName);
        var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

        // Strip data URI header if present
        var cleanBase64 = photoBase64;
        if (cleanBase64.indexOf(',') > -1) {
          cleanBase64 = cleanBase64.split(',')[1];
        }

        // Decode Base64 and create file in Drive
        var decodedBytes = Utilities.base64Decode(cleanBase64);
        var photoType = params.photoType || 'image/jpeg';
        var safeReportId = reportId.replace(/[\/\\:\*\?"<>\|]/g, '_');
        var fileName = params.photoName || ('Hazard_' + safeReportId + '_' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd_HHmmss') + '.jpg');

        var blob = Utilities.newBlob(decodedBytes, photoType, fileName);
        var driveFile = folder.createFile(blob);

        // Make accessible so anyone viewing the spreadsheet can open the picture
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        attachmentUrl = driveFile.getUrl();
        Logger.log('Photo saved to Drive successfully: ' + attachmentUrl);
      } catch (driveErr) {
        Logger.log('Drive upload error: ' + driveErr.toString());
        attachmentUrl = 'Upload error: ' + driveErr.message + (params.attachmentLink ? ' (' + params.attachmentLink + ')' : '');
      }
    } else if (params.attachmentLink && params.attachmentLink !== 'N/A' && params.attachmentLink.indexOf('http') === 0) {
      attachmentUrl = params.attachmentLink;
    }

    // 4. Map observation values
    var status = params.status || 'New Report - Open';
    var observationType = params.observationType || 'Unsafe Condition (UC)';
    var potentialSeverity = params.potentialSeverity || 'Medium';
    var observerSuggestion = params.observerSuggestion || 'N/A';
    var concernedDepartment = params.concernedDepartment || 'Maintenance';
    var observerInfo = params.observerInfo || 'Budhi Parkash';
    var dateTime = params.dateTime || Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
    var location = params.location || 'Shopfloor';
    var hazardDescription = params.hazardDescription || 'Safety observation logged via mobile app';
    var immediateAction = params.immediateAction || 'Immediate containment initiated';

    // 5. Append Row matching exact 'Safety Log' Column Sequence:
    // Col A: Report ID
    // Col B: Status
    // Col C: Observation Type
    // Col D: Potential Severity
    // Col E: Attachment Links (Google Drive Link)
    // Col F: Observer Suggestion (Continual Improvement)
    // Col G: Concerned Department Manager for Action
    // Col H: Observer Name / Email
    // Col I: Date and Time
    // Col J: Location
    // Col K: Observed Hazard/Condition
    // Col L: Immediate Action Taken
    var newRow = [
      reportId,              // Col A
      status,                // Col B
      observationType,       // Col C
      potentialSeverity,     // Col D
      attachmentUrl,         // Col E (Google Drive Link)
      observerSuggestion,    // Col F
      concernedDepartment,   // Col G
      observerInfo,          // Col H
      dateTime,              // Col I
      location,              // Col J
      hazardDescription,     // Col K
      immediateAction        // Col L
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      reportId: reportId,
      attachmentUrl: attachmentUrl,
      version: 'v2.0-drive-enabled'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doPost fatal error: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    system: 'SBL Specialty Coatings Safety Alert Observation API',
    version: 'v2.0-drive-enabled',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this function directly inside the Apps Script editor to grant Google Drive permissions
 * and verify that folder creation and Drive uploads work flawlessly!
 */
function authorizeAndTestDrive() {
  try {
    var folderName = 'SBL_Safety_Alert_Photos';
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    // Create a 1x1 test pixel
    var testBlob = Utilities.newBlob(Utilities.base64Decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='), 'image/png', 'auth_test_pixel.png');
    var file = folder.createFile(testBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var url = file.getUrl();
    Logger.log('SUCCESS: Google Drive storage is fully authorized!');
    Logger.log('Test file created: ' + url);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      ss.toast('Drive Authorization Successful! Test Photo URL: ' + url, 'SBL EHS', 8);
    }
  } catch (err) {
    Logger.log('Authorization test error: ' + err.toString());
  }
}
