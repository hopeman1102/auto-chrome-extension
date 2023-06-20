const selectOptionFromName = (select, name) => {
    const options = select.getElementsByTagName('option');
    for(let i = 0; i < options.length; i ++) {
        if(name === options[i].innerHTML) {
            return select.value = i > 0 ? i - 1 : 0;
        }
    }
    return 0;
}

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
                        const court = getSpanText(table, r, 1).replace(/&amp;/g, '&').replace(/&quot;/g, '"');
                        const name = getSpanText(table, r, 3).replace(/&amp;/g, '&').replace(/&quot;/g, '"');
                        if(name in companies) {
                            companies[name].push({date: getSpanText(table, r, 0)});
                        } else {
                            searchCompanies.push({bundesland, gericht, date, name, court})
                            companies[name] = [{date: getSpanText(table, r, 0)}];
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
                    let date = new Date();
                    let year = date.getFullYear();
                    let month = ("0" + (date.getMonth() + 1)).slice(-2);
                    let day = ("0" + date.getDate()).slice(-2);
                    let now = `${year}-${month}-${day}`;
            
                    const select = document.getElementById('frm_suche:lsom_bundesland:lsom');
                    select.value = selectOptionFromName(select, company.bundesland);
                    select.addEventListener('change', async () => {
                        while(document.getElementById('frm_suche:lsom_gericht:lsom').getAttribute('disabled')) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                        const select1 = document.getElementById('frm_suche:lsom_gericht:lsom');
                        select1.value = selectOptionFromName(select1, company.gericht);
                        document.getElementById('frm_suche:ldi_datumVon:datumHtml5').value = '2000-01-01';
                        document.getElementById('frm_suche:ldi_datumBis:datumHtml5').value = now;
                        document.getElementById('frm_suche:litx_firmaNachName:text').value = company.name;
                        document.getElementById('frm_suche:cbt_suchen').click();
                    });
                    select.dispatchEvent(new Event('change'));
                } else {
                    chrome.runtime.sendMessage({search: true});
                }
            }
        }
    }
    chrome.storage.local.set({searched: true});
}

loadSearchResult();