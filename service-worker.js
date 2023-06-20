// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// fetch('https://neu.insolvenzbekanntmachungen.de/ap/suche.jsf', {
//   method: 'POST',
//   body: JSON.stringify({
//     'frm_suche': 'frm_suche',
//     'frm_suche:lsom_bundesland:lsom': 9,
//     'frm_suche:lsom_gericht:lsom': 1,
//     'frm_suche:ldi_datumVon:datumHtml5': '2000-01-01',
//     'frm_suche:ldi_datumBis:datumHtml5': '2023-06-17',
//     'frm_suche:lsom_wildcard:lsom': 0,
//     'frm_suche:litx_firmaNachName:text': 'Grundstueck*',
//     'frm_suche:iaz_aktenzeichen:som_registerzeichen': '--',
//     'frm_suche:lsom_gegenstand:lsom': '-- Alle Gegenstände innerhalb des Verfahrens --',
//     'frm_suche:ireg_registereintrag:som_registergericht': '--',
//     'frm_suche:ireg_registereintrag:ihd_validator': true,
//     'frm_suche:cbt_suchen': 'Suchen',
//     'javax.faces.ViewState': '-4148127807254041564:7324281115120945752'
//   })
//   // responseType: 'cors',
//   // credentials: 'include',
// }).then(res => {
//   //console.log(res.headers.get('set-cookie')); // undefined
//   //console.log(document.cookie); // nope
//   return res.text();
// }).then(json => {
//   // console.log(json);
// });

const GOOGLE_ORIGIN = 'https://neu.insolvenzbekanntmachungen.de';

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  //const url = new URL(tab.url);
  // Enables the side panel on google.com
  // if (url.origin === GOOGLE_ORIGIN) {
  await chrome.sidePanel.setOptions({
    tabId,
    path: './pages/sidepanel.html',
    enabled: true
  });
    // if(tab.title === 'Insolvenzbekanntmachungen: Suchergebnis - Veröffentlichungs­liste') {
    //   await chrome.sidePanel.setOptions({
    //     tabId,
    //     path: './pages/search-company.html',
    //     enabled: true
    //   });
    // } else if(tab.title === 'Insolvenzbekanntmachungen: Suche nach Veröffentlichungen') {
    //   await chrome.sidePanel.setOptions({
    //     tabId,
    //     path: './pages/saved-company.html',
    //     enabled: true
    //   });
    // } else {
    //   await chrome.sidePanel.setOptions({
    //     tabId,
    //     enabled: false
    //   });
    // }
  // } else {
  //   // Disables the side panel on all other sites
  //   await chrome.sidePanel.setOptions({
  //     tabId,
  //     enabled: false
  //   });
  // }
});