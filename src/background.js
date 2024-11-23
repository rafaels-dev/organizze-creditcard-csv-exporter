import { parse } from 'json2csv';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'export_csv') {
    const transactions = request.transactions;
    const csvContent = generateCSV(transactions);
    const blob = new Blob([csvContent], { type: 'text/csv', charset: 'utf-8', withBOM: true });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1];
      sendResponse({ status: 'success', fileContent: base64data });
    };
    reader.readAsDataURL(blob);
    return true; // Keep the message channel open for sendResponse
  }
});

function generateCSV(transactions) {
  const fields = ['date', 'human_amount', 'description', 'repeat_index', 'repeat_total'];
  const opts = { fields, delimiter: ';', withBOM: true };

  const csv = parse(transactions, opts);
  return csv;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: 'tab_changed', tabId, url: tab.url});
  }
});