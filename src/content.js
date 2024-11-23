let transactions;

window.addEventListener('message', event => {
  if (event.source !== window) return;
  if (event.data.type && event.data.type === 'TRANSACTIONS_UPDATED') {
    transactions = event.data.transactions;
  }
});

function addElements() {
  let data_collector = document.querySelector('#organizze-power-tools__data-collector');
  data_collector?.remove();

  data_collector = document.createElement('script');
  data_collector.id = 'organizze-power-tools__data-collector';
  data_collector.src = chrome.runtime.getURL('scripts/data_collector.js');
  (document.head || document.documentElement).appendChild(data_collector);


  const invoiceHeader = document.querySelector('#invoice-header');
  document.querySelector('#organizze-power-tools__export-csv')?.remove();

  console.log('Organizze CSV Exporter: Invoice header:', invoiceHeader);
  if (invoiceHeader) {
    button = document.createElement('a');
    button.id = 'organizze-power-tools__export-csv';
    button.href = '#';
    button.style = `display: flex;
        height: 30px;
        width: 40px;
        align-items: center;
        justify-content: center;`;

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('images/csv.png');
    icon.style = `height: 30px; width: 30px;`;

    button.addEventListener('click', () => {
      const response = chrome.runtime.sendMessage({ action: 'export_csv', transactions });
      response.then(res => {
        const link = document.createElement('a');
        link.href = `data:text/csv;charset=utf-8;base64,${res.fileContent}`;
        link.download = 'transactions.csv';
        link.click();
      });
    });

    button.appendChild(icon);
    invoiceHeader.appendChild(button);
  }
}

function initialize() {
  console.log('Organizze CSV Exporter: Content script loaded');
  console.log('Organizze CSV Exporter: Current URL:', window.location.href);

  if (!window.location.href.match(/^https:\/\/app\.organizze\.com\.br\/.*\/cartao-de-credito\/.*\/faturas\/.*$/)) {
    console.log("Organizze CSV Exporter: This page doesn't seem to be a credit card invoice page. Aborting.");
    return;
  }

  addElements();

}

// Initialize the script on load
initialize();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'tab_changed') {
    console.log('Organizze CSV Exporter: Tab changed to', request.tabId);
    setTimeout(() => {
      initialize();
      sendResponse({ status: 'success' });
    }, 3000);
  }
  return true;
});