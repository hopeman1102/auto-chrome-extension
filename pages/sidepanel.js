document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.search) {
            updateUI();
        }
    });
});

function deleteChildrenAndAppend(parent, elements) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    parent.append(...elements);
}

async function updateUI() {
    const saveContainer = document.getElementById('save-container');
    const searchContainer = document.getElementById('search-container');
    const noticeContainer = document.getElementById('notice-container');

    const { savedCompanies } = await chrome.storage.local.get('savedCompanies');
    const { searchCompanies } = await chrome.storage.local.get('searchCompanies');
    const { selectedCompany } = await chrome.storage.local.get('selectedCompany');
    let notices = [];
    // show saved companies
    if(savedCompanies && savedCompanies.length > 0) {
        const template = document.getElementById("save-tbody-template");
        const elements = new Set();
        for (let i = 0; i < savedCompanies.length; i ++) {
            const company = savedCompanies[i];
            const element = template.content.firstElementChild.cloneNode(true);
            if(selectedCompany === company.name) {
                element.querySelector('.name').style.backgroundColor = "green";
                notices = company.notices;
                chrome.storage.local.set({selectedCompany: null});
            }
            element.querySelector('.no').textContent = (i + 1);
            element.querySelector(".name").textContent = company.name;
            element.querySelector(".notice").textContent = company.notices?.length;
            const button = element.querySelector('#show-button');
            button.addEventListener('click', function() {
                chrome.storage.local.set({selectedCompany: company.name});
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    // Update the URL of the tab
                    chrome.tabs.update(tabs[0].id, { url: 'https://neu.insolvenzbekanntmachungen.de/ap/suche.jsf' });
                });
            });
            const delButton = element.querySelector('#delete-button');
            delButton.addEventListener('click', function() {
                const datas = savedCompanies.filter((c) => c.name !== company.name);
                chrome.storage.local.set({savedCompanies: datas});
                updateUI();
            })
            elements.add(element);
        }
        deleteChildrenAndAppend(document.getElementById("save-content"), elements);
        saveContainer.style = "display";
    } else {
        saveContainer.style = "display:none";
    }

    // show search resutls
    if(searchCompanies && searchCompanies.length > 0) {
        const filters = savedCompanies ? searchCompanies.filter(value => !savedCompanies.map((c) => c.name).includes(value.name)) : searchCompanies;
        if(filters.length > 0) {
            const template = document.getElementById("search-tbody-template");
            const elements = new Set();
            for (let i = 0; i < filters.length; i ++) {
                const company = filters[i];
                const element = template.content.firstElementChild.cloneNode(true);
                element.querySelector('.no').textContent = (i + 1);
                element.querySelector(".name").textContent = company.name;
                element.querySelector(".court").textContent = company.court;
                const checkBox = element.querySelector('#save-checkbox');
                checkBox.addEventListener('click', function() {
                    const comps = savedCompanies ? savedCompanies : [];
                    const datas = checkBox.checked == true ? [...comps, company] : comps.filter((c) => c.name !== company.name);
                    chrome.storage.local.set({savedCompanies: datas});
                    updateUI();
    
                });
                elements.add(element);
            }
            deleteChildrenAndAppend(document.getElementById("search-content"), elements);
            searchContainer.style = "display";
        } else {
            searchContainer.style = "display:none";
        }
    } else {
        searchContainer.style = "display:none";
    }

    // show notices
    if(searchCompanies && searchCompanies.length > 0 && notices && notices.length > 0) {
        const template = document.getElementById("notice-tbody-template");
        const elements = new Set();
        for (let i = 0; i < notices.length; i ++) {
            const notice = notices[i];
            const element = template.content.firstElementChild.cloneNode(true);
            element.querySelector('.no').textContent = (i + 1);
            element.querySelector(".date").textContent = notice.date;
            const button = element.querySelector('#pop-button');
            button.addEventListener('click', function() {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {notice: notice.id});
                });
            });
            // const downButton = element.querySelector('#down-button');
            // downButton.addEventListener('click', function() {

            // })
            elements.add(element);
        }
        deleteChildrenAndAppend(document.getElementById("notice-content"), elements);
        noticeContainer.style = "display"

    } else {
        noticeContainer.style = "display:none";
    }
}
