// FormTextHelper - 右クリックメニューの作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "textareaDialog",
    title: "テキストエリアダイアログを表示",
    contexts: ["all"]
  });
});

// メニュー項目がクリックされたときの処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "textareaDialog") {
    // ダイアログを表示するメッセージを送信
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: "showDialogWithCheck" })
        .catch(error => {
          console.error("メッセージ送信エラー:", error);
        });
    }
  }
});
