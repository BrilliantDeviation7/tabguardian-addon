document.addEventListener("DOMContentLoaded", function () {
  browser.storage.local.get({ regexList: [] }, function (result) {
    updateListDisplay(result.regexList);
  });

  const addButton = document.getElementById("addButton");
  const archiveButton = document.getElementById("archiveButton");
  const closeButton = document.getElementById("closeButton");
  const textInput = document.getElementById("textInput");
  const status = document.getElementById("status");

  closeButton.addEventListener("click", function () {
    if (
      !confirm("Are you sure you want to close tabs excluded by your filters?")
    ) {
      return;
    }
    closeTabsMatchingRegex();
  });

  archiveButton.addEventListener("click", function () {
    if (!confirm("Are you sure you want to archive your tabs?")) {
      return;
    }
    browser.tabs.query({}, function (tabs) {
      const tabUrls = tabs.map((tab) => tab.url);
      console.log(tabUrls);

      saveUrlsToLocalStorage(tabUrls);

      const regexList = JSON.parse(localStorage.getItem("regexList")) || [];

      // closeTabsMatchingRegex(regexList);
    });
  });

  addButton.addEventListener("click", function () {
    const text = textInput.value.trim();
    if (text) {
      browser.storage.local.get({ regexList: [] }, function (result) {
        result.regexList.push(text);
        updateListDisplay(result.regexList);
        browser.storage.local.set({ regexList: result.regexList }, function () {
          status.textContent = "Item added!";
          setTimeout(() => (status.textContent = ""), 3000);
        });
      });
    }
  });
});

function updateListDisplay(items) {
  const tabsList = document.getElementById("tabsList");

  tabsList.innerHTML = "";
  items.forEach((item, index) => {
    let li = document.createElement("li");
    li.textContent = item;

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("deleteButton");
    deleteButton.innerHTML = `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000" stroke-width="1.5"><path d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9" fill="#000000"></path><path d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9H20Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 6H15.375M3 6H8.625M8.625 6V4C8.625 2.89543 9.52043 2 10.625 2H13.375C14.4796 2 15.375 2.89543 15.375 4V6M8.625 6H15.375" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
    deleteButton.onclick = function () {
      deleteItem(index);
    };
    li.appendChild(deleteButton);
    tabsList.appendChild(li);
  });
}

function deleteItem(index) {
  browser.storage.local.get({ regexList: [] }, function (result) {
    result.regexList.splice(index, 1);
    browser.storage.local.set({ regexList: result.regexList }, function () {
      updateListDisplay(result.regexList);
    });
  });
}

function saveUrlsToLocalStorage(urls) {
  browser.storage.local.get({ archivedUrls: [] }, function (result) {
    result.archivedUrls.push(...urls);
    browser.storage.local.set({ archivedUrls: result.archivedUrls });
  });
}

function closeTabsMatchingRegex() {
  browser.storage.local.get({ regexList: [] }, function (result) {
    browser.tabs.query({}, function (tabs) {
      for (const tab of tabs) {
        for (const regex of result.regexList) {
          if (new RegExp(regex).test(tab.url)) {
            browser.tabs.remove(tab.id);
            break;
          }
        }
      }
    });
  });
}
