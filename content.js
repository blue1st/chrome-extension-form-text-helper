// FormTextHelper - ダイアログを表示するためのメッセージ受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {  
  if (message.action === "showDialogWithCheck") {
    // フォーカスしている要素を確認し、入力フォームの場合はダイアログを表示
    const focusedElement = document.activeElement;
    const isInput = (focusedElement.tagName === 'TEXTAREA' || 
                    (focusedElement.tagName === 'INPUT' && 
                     (focusedElement.type === 'text' || 
                      focusedElement.type === 'email' || 
                      focusedElement.type === 'search' || 
                      focusedElement.type === 'tel' || 
                      focusedElement.type === 'url')));
    
    if (isInput) {
      showTextareaDialog(focusedElement);
    } else {
      // フォーム要素でない場合は、子要素からフォーム要素を探す
      const formElement = findFormElementInChild(focusedElement);
      
      if (formElement) {
        showTextareaDialog(formElement);
      } else {
        // フォーム要素でない場合に、クリップボードにコピーするダイアログを表示
        showClipboardDialog();
      }
    }
    return true;
  }

});

// ダイアログを表示する共通関数
function showDialog(title, isClipboard = false, onOkCallback = null) {
  // 既にダイアログが存在する場合は削除
  const existingDialog = document.getElementById('extension-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }

  // ダイアログ用のHTML要素を作成
  const dialogDiv = document.createElement('div');
  dialogDiv.id = 'extension-dialog';
  dialogDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 20px;
    z-index: 10000;
    border-radius: 8px;
    min-width: 300px;
    max-width: 500px;
  `;

  // ダイアログのタイトル
  const titleDiv = document.createElement('div');
  titleDiv.textContent = title;
  titleDiv.style.cssText = `
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 16px;
  `;

  // テキストエリア
  const textarea = document.createElement('textarea');
  textarea.id = 'dialog-textarea';
  textarea.placeholder = 'ここにテキストを入力してください...';
  textarea.style.cssText = `
    box-sizing: border-box;
    width: 100%;
    height: 120px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
  `;

  // ボタンのコンテナ
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    text-align: right;
    margin-top: 15px;
  `;

  // キャンセルボタン
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'キャンセル';
  cancelButton.style.cssText = `
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    margin-left: 10px;
    border-radius: 4px;
    cursor: pointer;
  `;

  // ボタンにクリックイベントを追加
  cancelButton.addEventListener('click', () => {
    dialogDiv.remove();
  });

  // OKボタンの処理
  const okButton = document.createElement('button');
  okButton.textContent = 'OK';
  okButton.style.cssText = `
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    margin-left: 10px;
    border-radius: 4px;
    cursor: pointer;
  `;

  if (isClipboard) {
    // クリップボード用ダイアログの処理
    okButton.textContent = 'クリップボードにコピー';
    okButton.style.cssText = `
      background: #28a745;
      color: white;
      border: none;
      padding: 8px 16px;
      margin-left: 10px;
      border-radius: 4px;
      cursor: pointer;
    `;
  }
  
  // テキストエリア用ダイアログの処理
  okButton.addEventListener('click', () => {
    const inputValue = textarea.value;
    if (inputValue.trim() !== '') {
      if (onOkCallback) {
        onOkCallback(inputValue);
      }
    }
    dialogDiv.remove();
  });
  

  // ダイアログに要素を追加
  dialogDiv.appendChild(titleDiv);
  dialogDiv.appendChild(textarea);
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(okButton);
  dialogDiv.appendChild(buttonContainer);

  // ダイアログをページに追加
  document.body.appendChild(dialogDiv);

  // テキストエリアにフォーカスを移す
  textarea.focus();
}

// テキストエリアダイアログを表示
function showTextareaDialog(focusedElement = null) {
  showDialog('テキストを入力してください', false, (inputValue) => {
    if (focusedElement) {
      insertTextIntoElement(inputValue, focusedElement);
    } else {
      // focusedElementが存在しない場合は、現在フォーカスしている要素に挿入
      const currentFocusedElement = document.activeElement;
      if (currentFocusedElement && 
          (currentFocusedElement.tagName === 'TEXTAREA' || 
           (currentFocusedElement.tagName === 'INPUT' && 
            (currentFocusedElement.type === 'text' || 
             currentFocusedElement.type === 'email' || 
             currentFocusedElement.type === 'search' || 
             currentFocusedElement.type === 'tel' || 
             currentFocusedElement.type === 'url')))) {
        insertTextIntoElement(inputValue, currentFocusedElement);
      }
    }
  });
}

// クリップボードにコピーするダイアログを表示
function showClipboardDialog() {
  showDialog('テキストをクリップボードにコピー', true, (inputValue) => {
    // クリップボードにコピー
    navigator.clipboard.writeText(inputValue).then(() => {
    // コピー成功時の処理
      alert('クリップボードにコピーしました');
    }).catch(err => {
      // エラー発生時の処理
      console.error('クリップボードへのコピーに失敗しました: ', err);
      alert('クリップボードへのコピーに失敗しました');
    });
  });
}

// 子要素からフォーム要素を探す
function findFormElementInChild(element) {
  // 子要素を再帰的に探索し、フォーム要素を見つける
  const formElements = ['TEXTAREA', 'INPUT'];
  const inputTypes = ['text', 'email', 'search', 'tel', 'url'];
  
  // 子要素からフォーム要素を探す
  for (let child of element.children) {
    if (formElements.includes(child.tagName)) {
      // textareaまたはinputの場合
      if (child.tagName === 'TEXTAREA' || 
          (child.tagName === 'INPUT' && inputTypes.includes(child.type))) {
        return child;
      }
    }
    
    // 子要素から再帰的に探索
    const found = findFormElementInChild(child);
    if (found) {
      return found;
    }
  }
  
  return null;
}

// 指定した要素にテキストを挿入
function insertTextIntoElement(text, element) {
  // 渡された要素がtextareaまたはinputの場合のみ処理
  if (element.tagName === 'TEXTAREA' || 
      (element.tagName === 'INPUT' && 
       (element.type === 'text' || 
        element.type === 'email' || 
        element.type === 'search' || 
        element.type === 'tel' || 
        element.type === 'url'))) {
    
    // テキストを挿入する位置を取得
    const start = element.selectionStart;
    const end = element.selectionEnd;
    
    // 現在の値を取得
    const currentValue = element.value;
    
    // テキストを挿入
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    
    // 値を更新
    element.value = newValue;
    
    // イベントを発火して変更を反映
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
