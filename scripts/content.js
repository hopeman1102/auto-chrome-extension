const selectOptionFromName = (select, name) => {
    const options = select.getElementsByTagName('option');
    for(let i = 0; i < options.length; i ++) {
        if(name === options[i].innerHTML) {
            return i - 1;
        }
    }
    return -1;
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    document.getElementById(message.notice).dispatchEvent(new Event('click'));
    // Check if there is an opened popup window
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    popupWindow = window.open("about:blank", "MsgWindow", "location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no,top=0,left=0");
    popupWindow.resizeTo(width * 0.8, height * 0.8);
    popupWindow.moveTo(width * 0.1, height * 0.1);
});

const loadSearchResult = async () => {
    const breadcrumb = document.getElementById("breadcrumb");
    const { savedCompanies } = await chrome.storage.local.get('savedCompanies');
    const { selectedCompany } = await chrome.storage.local.get('selectedCompany');
    if(breadcrumb) {
        const ops = breadcrumb.getElementsByTagName('li');
        if(ops && ops.length > 0) {
            const nav = ops[ops.length-1].getElementsByTagName('a')[0].innerHTML;
            if(nav === 'Suchergebnis') {
                const getSpanText = (table, r, c) => table.rows[r].cells[c].getElementsByTagName('span')[0].innerHTML;
                const searchTable = document.getElementsByClassName('ohneRahmen')[0].getElementsByTagName('tbody')[0];
                const bundesland = getSpanText(searchTable, 0, 1);
                const gericht = getSpanText(searchTable, 1, 1);
                const date = getSpanText(searchTable, 2, 1);
                try {
                    const table = document.getElementById('tbl_ergebnis').getElementsByTagName('tbody')[0];
                    const companies = {}
                    const searchCompanies = [];
                    for (let r = 0, n = table.rows.length; r < n; r++) {
                        const noticeId = table.rows[r].cells[6].getElementsByTagName('input')[1].getAttribute('id');
                        const court = getSpanText(table, r, 1).replace(/&amp;/g, '&').replace(/&quot;/g, '"');
                        const name = getSpanText(table, r, 3).replace(/&amp;/g, '&').replace(/&quot;/g, '"').split(',')[0];
                        if(name in companies) {
                            companies[name].push({date: getSpanText(table, r, 0), id: noticeId});
                        } else {
                            searchCompanies.push({bundesland, gericht, date, name, court})
                            companies[name] = [{date: getSpanText(table, r, 0), id: noticeId}];
                        }
                    }
                    const searchResults = searchCompanies.map((c) => ({
                        ...c,
                        notices: companies[c.name]
                    }));
                    chrome.storage.local.set({searchCompanies: searchResults});
                    
                    if(selectedCompany) {
                        const searchCompany = searchResults.find((c) => c.name === selectedCompany);
                        if(searchCompany) {
                            const datas = savedCompanies.map((c) => {
                                if(c.name === selectedCompany) {
                                    return {
                                        ...c,
                                        notices: searchCompany.notices
                                    }
                                } else {
                                    return c;
                                }
                            })
                            chrome.storage.local.set({savedCompanies: datas});
                        }
                    }
                } catch { }
                chrome.runtime.sendMessage({search: true});
            } else if(nav === 'Bekanntmachung suchen') {
                chrome.storage.local.set({searchCompanies: null});
                if(selectedCompany && savedCompanies && savedCompanies.length > 0) {
                    const company = savedCompanies.find((c) => c.name === selectedCompany);
                    if(company) {
                        let date = new Date();
                        let year = date.getFullYear();
                        let month = ("0" + (date.getMonth() + 1)).slice(-2);
                        let day = ("0" + date.getDate()).slice(-2);
                        let now = `${year}-${month}-${day}`;
                
                        const select = document.getElementById('frm_suche:lsom_bundesland:lsom');
                        const v = selectOptionFromName(select, company.bundesland);
                        if(v >= 0) {
                            select.value = v;
                            select.addEventListener('change', async () => {
                                while(document.getElementById('frm_suche:lsom_gericht:lsom').getAttribute('disabled')) {
                                    await new Promise(resolve => setTimeout(resolve, 100));
                                }
                                const select1 = document.getElementById('frm_suche:lsom_gericht:lsom');
                                const val = selectOptionFromName(select1, company.gericht);
                                if(val >= 0) {
                                    select1.value = val;
                                }
                                document.getElementById('frm_suche:ldi_datumVon:datumHtml5').value = '2000-01-01';
                                document.getElementById('frm_suche:ldi_datumBis:datumHtml5').value = now;
                                document.getElementById('frm_suche:litx_firmaNachName:text').value = company.name.split(',')[0];
                                document.getElementById('frm_suche:cbt_suchen').click();
                            });
                            select.dispatchEvent(new Event('change'));
                        } else {
                            document.getElementById('frm_suche:ldi_datumVon:datumHtml5').value = '2000-01-01';
                            document.getElementById('frm_suche:ldi_datumBis:datumHtml5').value = now;
                            document.getElementById('frm_suche:litx_firmaNachName:text').value = company.name.split(',')[0];
                            document.getElementById('frm_suche:cbt_suchen').click();
                        }

                    } else {
                        chrome.storage.local.set({selectedCompany: null});
                    }
                } else {
                    chrome.runtime.sendMessage({search: true});
                }
            }
        }
    }
    chrome.storage.local.set({searched: true});
}

loadSearchResult();