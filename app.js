const $ = (id) => document.getElementById(id);
const fileInput = $("file-input");
const formError = $("form-error");
let chosenFile = null;

fileInput.addEventListener("change", () => {
  chosenFile = fileInput.files?.[0] || null;
  $("file-name").textContent = chosenFile ? `${chosenFile.name} · ${(chosenFile.size / 1024 / 1024).toFixed(2)} MB` : "支持 DOCX、TXT、MD，最大 10 MB";
  $("clear-file").hidden = !chosenFile;
  if (chosenFile && ![".docx", ".txt", ".md"].some((ext) => chosenFile.name.toLowerCase().endsWith(ext))) {
    showError("目前支持 DOCX、TXT 和 Markdown 文件。");
    chosenFile = null;
    fileInput.value = "";
    $("file-name").textContent = "支持 DOCX、TXT、MD，最大 10 MB";
    $("clear-file").hidden = true;
  } else if (chosenFile && chosenFile.size > 10 * 1024 * 1024) {
    showError("文件超过 10 MB，请选择较小的文件或粘贴教案文本。");
    chosenFile = null;
    fileInput.value = "";
    $("file-name").textContent = "支持 DOCX、TXT、MD，最大 10 MB";
    $("clear-file").hidden = true;
  } else {
    hideError();
  }
});

$("clear-file").addEventListener("click", () => {
  chosenFile = null;
  fileInput.value = "";
  $("file-name").textContent = "支持 DOCX、TXT、MD，最大 10 MB";
  $("clear-file").hidden = true;
});

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}
function hideError() {
  formError.textContent = "";
  formError.hidden = true;
}

async function getPayload() {
  const lesson = $("lesson").value.trim();
  const payload = {
    lesson,
    subject: $("subject").value.trim(),
    grade: $("grade").value.trim(),
    duration: $("duration").value.trim(),
    fullRewrite: $("full-rewrite").checked,
  };
  if (chosenFile) {
    const buffer = await chosenFile.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    payload.file = { name: chosenFile.name, base64: btoa(binary) };
  }
  return payload;
}

$("submit").addEventListener("click", async () => {
  hideError();
  if (!chosenFile && !$("lesson").value.trim()) {
    showError("请粘贴教案内容，或先选择一个教案文件。");
    $("lesson").focus();
    return;
  }
  const button = $("submit");
  button.disabled = true;
  $("loading-overlay").hidden = false;
  try {
    const payload = await getPayload();
    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "诊断暂时未能完成，请稍后重试。");
    $("result-content").textContent = data.result;
    const details = [payload.subject, payload.grade, payload.duration].filter(Boolean).join(" · ");
    $("result-meta").textContent = `${details ? `${details}　/　` : ""}${payload.fullRewrite ? "完整优化稿" : "诊断与修改建议"}　·　${data.model}`;
    $("result-section").hidden = false;
    $("result-section").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showError(error.message || "连接失败，请确认服务正在运行后重试。");
  } finally {
    $("loading-overlay").hidden = true;
    button.disabled = false;
  }
});

$("copy-result").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("result-content").textContent);
    $("copy-result").textContent = "已复制";
    setTimeout(() => { $("copy-result").textContent = "复制结果"; }, 1600);
  } catch {
    $("copy-result").textContent = "复制失败";
  }
});

$("new-review").addEventListener("click", () => {
  $("result-section").hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

fetch("/api/status")
  .then((response) => response.json())
  .then((data) => {
    const state = $("connection-state");
    const text = state.querySelector("span");
    if (data.ready) text.textContent = `模型服务已配置 · ${data.model}`;
    else {
      state.classList.add("error");
      text.textContent = "待配置模型 API 密钥（见使用说明）";
    }
  })
  .catch(() => {
    const state = $("connection-state");
    state.classList.add("error");
    state.querySelector("span").textContent = "服务连接失败，请重启本地网页服务";
  });
