// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(tab);
    });

    // Most methods of the Chrome extension APIs are asynchronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, (tabs) => {
    //   url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function getLang(callback) {
    chrome.storage.sync.get('0', (items) => {
        callback(chrome.runtime.lastError ? null : items['0']);
    });
}

function saveLang(lang) {
    var items = {};
    items['0'] = lang;
    chrome.storage.sync.set(items);
}

document.addEventListener('DOMContentLoaded', () => {
    getCurrentTabUrl((tab) => {

        var btn = document.getElementById('btn');
        var lang = document.getElementById('lang');
        //
        // chrome.tabs.query({}, function (tabs) {
        //     for (var i = 0; i < tabs.length; i++) {
        //         if (tab.id < tabs[i].id) {
        //             chrome.tabs.remove(tabs[i].id);
        //         }
        //     }
        // });

        getLang((savedLang) => {
            if (savedLang) {
                lang.value = savedLang;
            }
        });

        btn.addEventListener("click", () => {

            var word = document.getElementById('word');

            //google image en to zh-TW
            var image_url = "http://translate.google.com/translate?hl=zh_TW&" +
                "sl=" + lang.value + "&tl=zh-TW&u=http%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3D" +
                word.value + "%26num%3D10%26hl%3Dfr%26site%3Dimghp%26tbm%3Disch%26sout%3D1%26biw%3D1242%26bih%3D640&sandbox=1";

            //forvo url
            var forvo_url = "http://forvo.com/word/" + word.value + "/#" + lang.value;

            //phonetic
            var phonetic_url = "http://translate.google.com/translate?sl=" + lang.value + "&tl=zh_TW&prev=_t&hl=zh_TW&ie=UTF-8&eotf=1&u=http://" + lang.value + ".wiktionary.org/wiki/" +
                word.value + "&act=url";

            chrome.tabs.create({url: image_url});
            chrome.tabs.create({url: forvo_url});
            chrome.tabs.create({url: phonetic_url});

            //korean
            if (lang.value === "ko") {
                var type_url = "https://koreanverb.app/?search=" + word.value;
                var translate_url ="http://tw.xyzdict.com/korean-chinese/" + word.value;

                chrome.tabs.create({url: type_url});
                chrome.tabs.create({url: translate_url});
            }

            chrome.tabs.update(tab.id, {active: true});
        });

        lang.addEventListener('change', () => {
            saveLang(lang.value);
        });
    });
});